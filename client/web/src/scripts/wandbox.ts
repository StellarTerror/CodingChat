import { ResponseError } from './utils';

const compilerInfo = [
  { lang: 'C', name: 'gcc-head-c' },
  { lang: 'C', name: 'gcc-11.1.0-c' },
  { lang: 'C', name: 'gcc-10.2.0-c' },
  { lang: 'C', name: 'gcc-9.3.0-c' },
  { lang: 'C', name: 'gcc-8.4.0-c' },
  { lang: 'C', name: 'gcc-7.5.0-c' },
  { lang: 'C', name: 'gcc-6.5.0-c' },
  { lang: 'C', name: 'gcc-5.5.0-c' },
  { lang: 'C', name: 'gcc-4.9.4-c' },
  { lang: 'CPP', name: 'gcc-head-pp' },
  { lang: 'C++', name: 'gcc-head' },
  { lang: 'C++', name: 'gcc-11.1.0' },
  { lang: 'C++', name: 'gcc-10.2.0' },
  { lang: 'C++', name: 'gcc-9.3.0' },
  { lang: 'C++', name: 'gcc-8.4.0' },
  { lang: 'C++', name: 'gcc-7.5.0' },
  { lang: 'C++', name: 'gcc-6.5.0' },
  { lang: 'C++', name: 'gcc-5.5.0' },
  { lang: 'C++', name: 'gcc-4.9.4' },
  { lang: 'C', name: 'clang-head-c' },
  { lang: 'C', name: 'clang-13.0.0-c' },
  { lang: 'C', name: 'clang-12.0.1-c' },
  { lang: 'C', name: 'clang-11.1.0-c' },
  { lang: 'C', name: 'clang-10.0.1-c' },
  { lang: 'C', name: 'clang-9.0.1-c' },
  { lang: 'C', name: 'clang-8.0.1-c' },
  { lang: 'C', name: 'clang-7.1.0-c' },
  { lang: 'CPP', name: 'clang-head-pp' },
  { lang: 'C++', name: 'clang-head' },
  { lang: 'C++', name: 'clang-13.0.0' },
  { lang: 'C++', name: 'clang-12.0.1' },
  { lang: 'C++', name: 'clang-11.1.0' },
  { lang: 'C++', name: 'clang-10.0.1' },
  { lang: 'C++', name: 'clang-9.0.1' },
  { lang: 'C++', name: 'clang-8.0.1' },
  { lang: 'C++', name: 'clang-7.1.0' },
  { lang: 'C#', name: 'mono-6.12.0.122' },
  { lang: 'C#', name: 'mono-5.20.1.34' },
  { lang: 'Erlang', name: 'erlang-23.3.1' },
  { lang: 'Erlang', name: 'erlang-22.3.4.16' },
  { lang: 'Erlang', name: 'erlang-21.3.8.22' },
  { lang: 'Elixir', name: 'elixir-1.11.4' },
  { lang: 'Elixir', name: 'elixir-1.10.4' },
  { lang: 'Haskell', name: 'ghc-9.0.1' },
  { lang: 'Haskell', name: 'ghc-8.10.4' },
  { lang: 'Haskell', name: 'ghc-8.8.4' },
  { lang: 'D', name: 'dmd-2.096.0' },
  { lang: 'D', name: 'ldc-1.25.1' },
  { lang: 'D', name: 'ldc-1.24.0' },
  { lang: 'D', name: 'ldc-1.23.0' },
  { lang: 'Java', name: 'openjdk-jdk-15.0.3+2' },
  { lang: 'Java', name: 'openjdk-jdk-14.0.2+12' },
  { lang: 'Rust', name: 'rust-1.51.0' },
  { lang: 'Rust', name: 'rust-1.50.0' },
  { lang: 'Python', name: 'cpython-3.9.3' },
  { lang: 'Python', name: 'cpython-3.8.9' },
  { lang: 'Python', name: 'cpython-3.7.10' },
  { lang: 'Python', name: 'cpython-3.6.12' },
  { lang: 'Python', name: 'cpython-2.7.18' },
  { lang: 'Ruby', name: 'ruby-3.1.0' },
  { lang: 'Ruby', name: 'ruby-3.0.1' },
  { lang: 'Ruby', name: 'ruby-2.7.3' },
  { lang: 'Ruby', name: 'mruby-3.0.0' },
  { lang: 'Ruby', name: 'mruby-2.1.2' },
  { lang: 'Ruby', name: 'mruby-1.4.1' },
  { lang: 'Scala', name: 'scala-2.13.5' },
  { lang: 'Scala', name: 'scala-2.12.13' },
  { lang: 'Groovy', name: 'groovy-3.0.8' },
  { lang: 'Groovy', name: 'groovy-2.5.14' },
  { lang: 'JavaScript', name: 'nodejs-14.16.1' },
  { lang: 'JavaScript', name: 'nodejs-12.22.1' },
  { lang: 'JavaScript', name: 'nodejs-10.24.1' },
  { lang: 'JavaScript', name: 'spidermonkey-88.0.0' },
  { lang: 'Swift', name: 'swift-5.3.3' },
  { lang: 'Perl', name: 'perl-5.34.0' },
  { lang: 'Perl', name: 'perl-5.33.8' },
  { lang: 'Perl', name: 'perl-5.32.1' },
  { lang: 'Perl', name: 'perl-5.30.3' },
  { lang: 'PHP', name: 'php-8.0.3' },
  { lang: 'PHP', name: 'php-7.4.16' },
  { lang: 'PHP', name: 'php-5.6.40' },
  { lang: 'Lua', name: 'lua-5.4.3' },
  { lang: 'Lua', name: 'lua-5.3.6' },
  { lang: 'Lua', name: 'lua-5.2.4' },
  { lang: 'Lua', name: 'luajit-2.0.5' },
  { lang: 'Lua', name: 'luajit-2.0.4' },
  { lang: 'Lua', name: 'luajit-2.0.3' },
  { lang: 'SQL', name: 'sqlite-3.35.5' },
  { lang: 'Pascal', name: 'fpc-3.2.0' },
  { lang: 'Pascal', name: 'fpc-3.0.4' },
  { lang: 'Pascal', name: 'fpc-2.6.4' },
  { lang: 'Lisp', name: 'clisp-2.49' },
  { lang: 'Lazy K', name: 'lazyk' },
  { lang: 'Vim script', name: 'vim-8.2.2811' },
  { lang: 'Vim script', name: 'vim-8.1.2424' },
  { lang: 'Python', name: 'pypy-3.7-v7.3.4' },
  { lang: 'Python', name: 'pypy-2.7-v7.3.4' },
  { lang: 'OCaml', name: 'ocaml-4.12.0' },
  { lang: 'OCaml', name: 'ocaml-4.11.2' },
  { lang: 'OCaml', name: 'ocaml-4.10.2' },
  { lang: 'Go', name: 'go-1.16.3' },
  { lang: 'Go', name: 'go-1.15.11' },
  { lang: 'Go', name: 'go-1.14.15' },
  { lang: 'Lisp', name: 'sbcl-2.1.3' },
  { lang: 'Lisp', name: 'sbcl-1.5.9' },
  { lang: 'Bash script', name: 'bash' },
  { lang: 'Pony', name: 'pony-0.39.1' },
  { lang: 'Pony', name: 'pony-0.38.3' },
  { lang: 'Crystal', name: 'crystal-1.0.0' },
  { lang: 'Crystal', name: 'crystal-0.36.1' },
  { lang: 'Nim', name: 'nim-1.6.0' },
  { lang: 'Nim', name: 'nim-1.4.8' },
  { lang: 'Nim', name: 'nim-1.4.6' },
  { lang: 'Nim', name: 'nim-1.2.8' },
  { lang: 'Nim', name: 'nim-1.0.10' },
  { lang: 'OpenSSL', name: 'openssl-1.1.1k' },
  { lang: 'OpenSSL', name: 'openssl-1.0.2u' },
  { lang: 'OpenSSL', name: 'openssl-0.9.8zh' },
  { lang: 'C#', name: 'dotnetcore-5.0.201' },
  { lang: 'C#', name: 'dotnetcore-3.1.407' },
  { lang: 'C#', name: 'dotnetcore-2.1.814' },
  { lang: 'R', name: 'r-4.0.5' },
  { lang: 'R', name: 'r-3.6.3' },
  { lang: 'TypeScript', name: 'typescript-4.2.4 nodejs 14.16.1' },
  { lang: 'TypeScript', name: 'typescript-3.9.9 nodejs 14.16.1' },
  { lang: 'Julia', name: 'julia-1.6.1' },
  { lang: 'Julia', name: 'julia-1.0.5' },
] as const;
type CompilerInfo = typeof compilerInfo;

type Language = CompilerInfo[number]['lang'];
type CompilerName<L extends Language> = CompilerInfo[number] extends infer Info
  ? Info extends { lang: L; name: string }
    ? Info['name']
    : never
  : never;

export const getCompilerNameListOf = <L extends Language>(language: L) =>
  compilerInfo.filter(({ lang }) => lang === language).map(({ name }) => name) as CompilerName<L>[];

type CompileRequest<L extends Language> = {
  compiler: CompilerName<L>;
  code: string;
  stdin: string;
};

type CompileResponse = {
  status: string;
  signal: string;
  compiler_output: string;
  compiler_error: string;
  compiler_message: string;
  program_output: string;
  program_error: string;
  program_message: string;
};

const endpoint = 'https://wandbox.org/api/compile.json';
export const request = <L extends Language>(request: CompileRequest<L>) =>
  fetch(endpoint, { method: 'post', body: JSON.stringify(request) }).then(response => {
    if (response.ok) {
      return response.json() as Promise<CompileResponse>;
    }
    throw new ResponseError(response);
  });
