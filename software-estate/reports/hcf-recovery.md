# HCF missing-entrypoint investigation

Outcome: partial source recovery; the exact complete package required by the newer standalone HTML remains unavailable in targeted accessible sources. No external edits or application execution occurred.

## Strongest evidence

1. Original 103,660-byte file: https://drive.google.com/file/d/171X1yM2Twh6FJsRGAzJt9heJw46cWR27/view
2. Older 103,709-byte sibling: https://drive.google.com/file/d/1o6fQe8M0ETlNUVjHaQpjSjcZryVUtbBz/view . Its only byte-level content difference is the main module line `/index.tsx`, confirming the acquired file lost that tag. Restoring the line alone cannot fix missing source.
3. HCF Google AI Studio codebase saved-page folder: https://drive.google.com/drive/folders/1KPAlz95sjlEoJ6Y4y5YeZp9rT5jh-Ylw . Its `saved_resource.html` directly links `index.ts` and `index.css`.
4. Served module: https://drive.google.com/file/d/1PiU9T6Hr7zT0pmoE1nEy9yFutpmaUmQg/view . Its inline source map yielded 709,628 UTF-8 bytes of original TypeScript (708,475 characters).
5. CSS: https://drive.google.com/file/d/1ZKye0TG4jvicm00ItGeD2vL0fK_8_Z8b/view . 68,692 bytes.
6. Reference HTML: https://drive.google.com/file/d/1dq2DzGUK8r41ToVNGZXS0GzPdiGI2JC6/view . 203,832 bytes, captured from `https://ais-dev-r4of5qioaj4liodc2bcu6s-823172532299.asia-east1.run.app/`; this origin was not visited.

## Search boundary and stopping condition

Drive HCF search found four saved-page asset-folder variants and standalone siblings. The codebase, latest, and subscription captures list identically sized index.ts/index.css assets; an older July capture lists smaller versions. None of these targeted asset listings contains the missing governance-scheduler or firebase-setup modules. Targeted Drive and GitHub searches for those two module names returned no results. GitHub HCF/workstation searches across Keddeh1 returned no matching app source (only an unrelated lockfile hash for HCF). No Library reads were attempted.

The accessible report `SOVEREIGN_K_SYSTEMS_MASTER_CODEBASE_REPORT.md` mentions a different 5.2 MB carrier at `kera_server/ingested_repos/ServerSpace-DNS-Broadcast/hcf_workstation.html`; this is a narrative claim and does not establish identity with the 103 KB standalone file or recover its package.

## Remaining blocker

The recovered TypeScript requires 11 local source/config imports plus package dependencies. No matching manifest/lockfile is present. The saved reference DOM differs from the standalone, and their entrypoint extensions differ. Exact assembly is therefore unverified and the recovered candidate is explicitly not runnable. Missing imports and static evidence are listed in `../working/hcf-recovered/README.md` and `../evidence/hcf-recovery.json`.

Preserved files are in `../originals/hcf-recovery`; candidate source-only workspace is `../working/hcf-recovered`. Raw signed acquisition URLs were not saved. Original files were not modified.
