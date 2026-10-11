    function serializeCSVValue(value) {
      const text = value === null || value === undefined ? '' : String(value);
      return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    }

    function serializeCSV(rows) {
      if (!rows || rows.length === 0) return '';
      const cols = Object.keys(rows[0]);
      const records = [cols.map(serializeCSVValue).join(',')];
      rows.forEach(row => {
        records.push(cols.map(col => serializeCSVValue(row[col])).join(','));
      });
      return records.join('\r\n') + '\r\n';
    }

