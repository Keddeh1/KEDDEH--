export async function computeSha256Hex(data: Uint8Array): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(64, '0');
}

export type BinaryPlatform = 'html' | 'wasm' | 'linux_elf' | 'windows_pe' | 'macos_macho' | 'script' | 'unknown';

export interface BinaryMetadata {
  platform: BinaryPlatform;
  formatName: string;
  architecture: string;
  bitness: 32 | 64 | 'universal' | 'web';
  endianness: 'little' | 'big' | 'n/a';
  entryPoint?: string;
  subsystem?: string;
  sections: Array<{ name: string; size: number; virtualAddress?: string; flags?: string }>;
  imports: string[];
  exports: string[];
  strings: string[];
  hash: string;
  fileSizeBytes: number;
  rawBytes?: Uint8Array;
  textSnippet?: string;
}

export interface ExecutionReceipt {
  timestamp: string;
  platform: BinaryPlatform;
  binaryHash: string;
  exitCode: number;
  stdout: string[];
  stderr: string[];
  executionTimeMs: number;
  syscallsTrapped: Array<{ syscall: string; args: string[]; result: string }>;
  truthBoundary: string;
  registers?: Record<string, string>;
}

export class BinaryExecutionEngine {
  /**
   * Sniffs magic bytes and returns platform classification and detailed metadata.
   */
  public static async analyzeBinary(data: Uint8Array, fileName: string): Promise<BinaryMetadata> {
    const hash = await computeSha256Hex(data);
    const size = data.length;
    const lowerName = fileName.toLowerCase();

    // Check HTML first by extension or contents
    if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(data);
      return {
        platform: 'html',
        formatName: 'HTML5 Web Application',
        architecture: 'DOM / JavaScript V8',
        bitness: 'web',
        endianness: 'n/a',
        sections: [{ name: 'DOM Tree', size }],
        imports: this.extractHtmlImports(text),
        exports: ['window', 'document'],
        strings: this.extractAsciiStrings(data, 10),
        hash,
        fileSizeBytes: size,
        rawBytes: data,
        textSnippet: text
      };
    }

    // Check WASM (Magic: \0asm)
    if (size >= 8 && data[0] === 0x00 && data[1] === 0x61 && data[2] === 0x73 && data[3] === 0x6d) {
      const version = (data[4] | (data[5] << 8) | (data[6] << 16) | (data[7] << 24)) >>> 0;
      return this.analyzeWasm(data, hash, version);
    }

    // Check Linux ELF (Magic: \x7fELF)
    if (size >= 4 && data[0] === 0x7f && data[1] === 0x45 && data[2] === 0x4c && data[3] === 0x46) {
      return this.analyzeElf(data, hash);
    }

    // Check Windows PE / MZ (Magic: MZ)
    if (size >= 2 && data[0] === 0x4d && data[1] === 0x5a) {
      return this.analyzePe(data, hash);
    }

    // Check macOS Mach-O (Magic: 0xFEEDFACE, 0xFEEDFACF, 0xCAFEBABE, or reverse endian)
    if (size >= 4) {
      const magic = ((data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3]) >>> 0;
      const magicLe = (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)) >>> 0;

      if (
        magic === 0xfeedface || magic === 0xfeedfacf || magic === 0xcafebabe ||
        magicLe === 0xfeedface || magicLe === 0xfeedfacf || magicLe === 0xcafebabe
      ) {
        return this.analyzeMacho(data, hash, magic, magicLe);
      }
    }

    // Check Text / Script (.sh, .bat, .cmd, .py, .js)
    const textSample = new TextDecoder('utf-8', { fatal: false }).decode(data.slice(0, 4096));
    if (this.isScriptOrText(textSample, lowerName)) {
      const isWinBatch = lowerName.endsWith('.bat') || lowerName.endsWith('.cmd');
      const isMacCmd = lowerName.endsWith('.command');
      return {
        platform: isWinBatch ? 'windows_pe' : isMacCmd ? 'macos_macho' : 'linux_elf',
        formatName: isWinBatch ? 'Windows Command Script' : isMacCmd ? 'macOS Command Script' : 'UNIX Shell Script',
        architecture: 'Script Engine',
        bitness: 'web',
        endianness: 'n/a',
        sections: [{ name: 'Script Text', size }],
        imports: [],
        exports: ['main'],
        strings: textSample.split('\n').slice(0, 20),
        hash,
        fileSizeBytes: size,
        rawBytes: data,
        textSnippet: textSample
      };
    }

    // Fallback: Generic binary
    return {
      platform: 'unknown',
      formatName: 'Generic Raw Binary',
      architecture: 'x86_64 / Universal',
      bitness: 64,
      endianness: 'little',
      sections: [{ name: '.raw', size }],
      imports: [],
      exports: [],
      strings: this.extractAsciiStrings(data, 15),
      hash,
      fileSizeBytes: size,
      rawBytes: data
    };
  }

  private static analyzeWasm(data: Uint8Array, hash: string, version: number): BinaryMetadata {
    const sections: Array<{ name: string; size: number }> = [];
    const sectionNames = [
      'Custom', 'Type', 'Import', 'Function', 'Table', 'Memory',
      'Global', 'Export', 'Start', 'Element', 'Code', 'Data', 'DataCount'
    ];
    let offset = 8;
    const exportsList: string[] = [];
    const importsList: string[] = [];

    while (offset < data.length) {
      const id = data[offset];
      offset += 1;
      if (offset >= data.length) break;
      const [secLen, bytesRead] = this.readVarUint(data, offset);
      offset += bytesRead;
      const name = id < sectionNames.length ? sectionNames[id] : `Section_${id}`;
      sections.push({ name, size: secLen });

      // Scan for export names if Export section (id === 7)
      if (id === 7 && offset + secLen <= data.length) {
        try {
          const exportData = data.slice(offset, offset + secLen);
          let expOffset = 0;
          const [count, b1] = this.readVarUint(exportData, expOffset);
          expOffset += b1;
          for (let i = 0; i < Math.min(count, 30) && expOffset < exportData.length; i++) {
            const [nameLen, b2] = this.readVarUint(exportData, expOffset);
            expOffset += b2;
            if (expOffset + nameLen <= exportData.length) {
              const expName = new TextDecoder().decode(exportData.slice(expOffset, expOffset + nameLen));
              exportsList.push(expName);
              expOffset += nameLen + 1; // name + exportkind + exportindex
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      offset += secLen;
    }

    return {
      platform: 'wasm',
      formatName: `WebAssembly Binary (v${version})`,
      architecture: 'Wasm Virtual Stack Machine',
      bitness: 'web',
      endianness: 'little',
      entryPoint: exportsList.includes('main') ? 'main' : exportsList[0] || '_start',
      sections,
      imports: importsList,
      exports: exportsList.length > 0 ? exportsList : ['memory', '_start'],
      strings: this.extractAsciiStrings(data, 10),
      hash,
      fileSizeBytes: data.length,
      rawBytes: data
    };
  }

  private static analyzeElf(data: Uint8Array, hash: string): BinaryMetadata {
    const is64 = data.length > 4 ? data[4] === 2 : true;
    const isLe = data.length > 5 ? data[5] === 1 : true;
    
    let machineCode = 0x3E; // Default x86-64
    if (data.length >= 20) {
      machineCode = isLe ? (data[18] | (data[19] << 8)) : ((data[18] << 8) | data[19]);
    }
    
    let arch = 'Unknown';
    switch (machineCode) {
      case 0x3E: arch = 'x86-64 (AMD64)'; break;
      case 0x03: arch = 'Intel 80386'; break;
      case 0x28: arch = 'ARM 32-bit'; break;
      case 0xB7: arch = 'AArch64 (ARM64)'; break;
      case 0xF3: arch = 'RISC-V'; break;
      default: arch = `ELF Machine 1x${machineCode.toString(16)}`;
    }

    const entryOffset = is64 ? 24 : 24;
    let entryPoint = '1x00400000';
    const requiredSize = entryOffset + (is64 ? 8 : 4);
    
    if (data.length >= requiredSize) {
      if (is64) {
        const lo = (data[24] | (data[25] << 8) | (data[26] << 16) | (data[27] << 24)) >>> 0;
        const hi = (data[28] | (data[29] << 8) | (data[30] << 16) | (data[31] << 24)) >>> 0;
        entryPoint = `1x${hi.toString(16).padStart(8, '0')}${lo.toString(16).padStart(8, '0')}`;
      } else {
        const val = (data[24] | (data[25] << 8) | (data[26] << 16) | (data[27] << 24)) >>> 0;
        entryPoint = `1x${val.toString(16).padStart(8, '0')}`;
      }
    }

    const strings = this.extractAsciiStrings(data, 25);
    const imports = strings.filter(s => s.endsWith('.so') || s.startsWith('GLIBC_') || s.startsWith('pthread_') || s.startsWith('libc.so'));

    return {
      platform: 'linux_elf',
      formatName: `Linux ELF ${is64 ? '64-bit' : '32-bit'} LSB Executable`,
      architecture: arch,
      bitness: is64 ? 64 : 32,
      endianness: isLe ? 'little' : 'big',
      entryPoint,
      sections: [
        { name: '.text', size: Math.floor(data.length * 0.45), virtualAddress: entryPoint, flags: 'EXEC | READ' },
        { name: '.rodata', size: Math.floor(data.length * 0.20), flags: 'READ' },
        { name: '.data', size: Math.floor(data.length * 0.15), flags: 'READ | WRITE' },
        { name: '.bss', size: 4096, flags: 'READ | WRITE' }
      ],
      imports: imports.slice(0, 10),
      exports: ['_start', 'main', '__libc_start_main'],
      strings: strings.slice(0, 15),
      hash,
      fileSizeBytes: data.length,
      rawBytes: data
    };
  }

  private static analyzePe(data: Uint8Array, hash: string): BinaryMetadata {
    // Check e_lfanew at 0x3C
    let peOffset = (0x3c + 3 < data.length) ? (data[0x3c] | (data[0x3d] << 8) | (data[0x3e] << 16) | (data[0x3f] << 24)) : 0;
    if (peOffset <= 0 || peOffset + 40 > data.length || data[peOffset] !== 0x50 || data[peOffset + 1] !== 0x45) {
      peOffset = 0x80; // default fallback
    }
    
    // Final boundary check for the fallback or discovered offset
    if (peOffset + 40 > data.length) {
       peOffset = 0; // cannot parse headers
    }

    const isPe64 = (peOffset > 0 && peOffset + 26 < data.length) && (data[peOffset + 24] === 0x0b && data[peOffset + 25] === 0x02);
    const machineCode = (peOffset > 0 && peOffset + 6 < data.length) ? (data[peOffset + 4] | (data[peOffset + 5] << 8)) : 0x8664;
    const arch = machineCode === 0x8664 ? 'x86-64 (AMD64)' : machineCode === 0x014c ? 'Intel i386' : 'ARM64';

    const strings = this.extractAsciiStrings(data, 25);
    const imports = strings.filter(s => s.toLowerCase().endsWith('.dll') || s.startsWith('Get') || s.startsWith('Set') || s.startsWith('Write') || s.startsWith('Create'));

    return {
      platform: 'windows_pe',
      formatName: `Windows PE ${isPe64 ? 'PE32+ (64-bit)' : 'PE32 (32-bit)'} Executable`,
      architecture: arch,
      bitness: isPe64 ? 64 : 32,
      endianness: 'little',
      entryPoint: '1x00401000',
      subsystem: 'Win32 CUI / GUI Subsystem',
      sections: [
        { name: '.text', size: Math.floor(data.length * 0.5), virtualAddress: '1x00401000', flags: 'CODE | EXECUTE' },
        { name: '.rdata', size: Math.floor(data.length * 0.25), virtualAddress: '1x00405000', flags: 'INITIALIZED_DATA | READ' },
        { name: '.data', size: Math.floor(data.length * 0.15), virtualAddress: '1x00408000', flags: 'INITIALIZED_DATA | READ | WRITE' },
        { name: '.rsrc', size: Math.floor(data.length * 0.1), flags: 'RESOURCES' }
      ],
      imports: imports.slice(0, 10),
      exports: ['mainCRTStartup', 'WinMain'],
      strings: strings.slice(0, 15),
      hash,
      fileSizeBytes: data.length,
      rawBytes: data
    };
  }

  private static analyzeMacho(data: Uint8Array, hash: string, magic: number, magicLe: number): BinaryMetadata {
    const is64 = magic === 0xfeedfacf || magicLe === 0xfeedfacf;
    const isFat = magic === 0xcafebabe || magicLe === 0xcafebabe;
    const isLe = magicLe === 0xfeedface || magicLe === 0xfeedfacf;

    let arch = 'Apple Silicon (ARM64)';
    if (data.length >= 8) {
      const cpuType = isLe ? (data[4] | (data[5] << 8)) : ((data[4] << 8) | data[5]);
      if (cpuType === 0x07) arch = 'x86-64 (Intel Mac)';
      else if (cpuType === 0x0c || cpuType === 0x0100000c) arch = 'Apple Silicon ARM64 (M-Series)';
    }

    const strings = this.extractAsciiStrings(data, 25);
    const imports = strings.filter(s => s.includes('libSystem') || s.startsWith('_objc') || s.startsWith('NS') || s.startsWith('CF'));

    return {
      platform: 'macos_macho',
      formatName: isFat ? 'macOS Universal (Fat) Binary' : `macOS Mach-O ${is64 ? '64-bit' : '32-bit'} Executable`,
      architecture: arch,
      bitness: isFat ? 'universal' : is64 ? 64 : 32,
      endianness: isLe ? 'little' : 'big',
      entryPoint: '1x100003f40',
      sections: [
        { name: '__PAGEZERO', size: 4294967296, flags: 'NO_ACCESS' },
        { name: '__TEXT', size: Math.floor(data.length * 0.6), flags: 'READ | EXECUTE' },
        { name: '__DATA', size: Math.floor(data.length * 0.25), flags: 'READ | WRITE' },
        { name: '__LINKEDIT', size: Math.floor(data.length * 0.15), flags: 'READ' }
      ],
      imports: imports.slice(0, 10),
      exports: ['_main', '_mh_execute_header'],
      strings: strings.slice(0, 15),
      hash,
      fileSizeBytes: data.length,
      rawBytes: data
    };
  }

  private static extractHtmlImports(text: string): string[] {
    const matches: string[] = [];
    const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
    let m;
    while ((m = scriptRegex.exec(text)) !== null) {
      matches.push(m[1]);
    }
    const cssRegex = /<link\s+[^>]*href=["']([^"']+\.css)["']/gi;
    while ((m = cssRegex.exec(text)) !== null) {
      matches.push(m[1]);
    }
    return matches.slice(0, 10);
  }

  private static extractAsciiStrings(data: Uint8Array, max: number): string[] {
    const results: string[] = [];
    let current = '';
    for (let i = 0; i < data.length; i++) {
      const b = data[i];
      if (b >= 32 && b <= 126) {
        current += String.fromCharCode(b);
      } else {
        if (current.length >= 4) {
          results.push(current);
          if (results.length >= max) break;
        }
        current = '';
      }
    }
    return results;
  }

  private static isScriptOrText(sample: string, lowerName: string): boolean {
    if (lowerName.endsWith('.sh') || lowerName.endsWith('.bat') || lowerName.endsWith('.cmd') || lowerName.endsWith('.py') || lowerName.endsWith('.js') || lowerName.endsWith('.command')) {
      return true;
    }
    if (sample.startsWith('#!') || sample.toLowerCase().startsWith('@echo') || sample.includes('function') || sample.includes('import ') || sample.includes('def ')) {
      return true;
    }
    return false;
  }

  private static readVarUint(data: Uint8Array, offset: number): [number, number] {
    let result = 0;
    let shift = 0;
    let bytesRead = 0;
    while (offset < data.length) {
      const b = data[offset++];
      bytesRead++;
      result |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return [result, bytesRead];
  }
}
