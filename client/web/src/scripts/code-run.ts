import { request } from './wandbox';

type Language = 'C++' | 'Python';

export const run = (code: string, stdin: string, language: Language) =>
  request<Language>({
    compiler: language === 'C++' ? 'gcc-head' : 'cpython-3.9.3',
    code,
    stdin,
  })
    .then(({ compiler_output, compiler_error, program_output, program_error }) => {
      let log = [compiler_output, compiler_error, program_error].join('\n');
      return [program_output, log] as const;
    })
    .catch(err => {
      return ['', 'could not run the code:\n' + err.message] as const;
    });
