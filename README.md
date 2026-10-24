# Reproductions

Small, runnable projects that reproduce software bugs and compatibility issues.

Each project has its own dependencies, setup instructions, and expected result. Some commands intentionally fail to demonstrate the reported issue.

| Project | What it reproduces |
| --- | --- |
| [React Rust compiler Unicode diagnostic](react/rust-compiler-unicode-diagnostic/) | The experimental Rust Babel adapter places a diagnostic underline too far left after a non-ASCII character. |
| [TypeScript LSP shutdown exit code](typescript/lsp-shutdown-exit-code/) | The language server exits with code 1 after a normal `shutdown` followed by `exit` (#64742). |
| [TypeScript LSP referenced project rebuild](typescript/lsp-referenced-project-rebuild/) | Opening app files repeatedly builds and deletes an unrelated referenced project (#64862). |
| [TypeScript declaration emit missing diagnostic context](typescript/declaration-emit-missing-diagnostic-context/) | Declaration emit panics on a labeled interface instead of reporting a diagnostic (#64666). |

Issue drafts are kept in [docs/issues](docs/issues/).
