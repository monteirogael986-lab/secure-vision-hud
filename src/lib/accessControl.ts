// Access control logic — checks user input for restricted keywords

export function checkAccess(input: string): { granted: boolean; message: string } {
  const lower = input.toLowerCase();

  // Rule 1: "acessar os dados da planta" -> Access Denied (Red)
  if (lower.includes("dados da planta") || lower.includes("acessar dados")) {
    return {
      granted: false,
      message: "ACESSO NEGADO: Você não possui privilégios para acessar dados sensíveis da planta industrial.",
    };
  }

  // Rule 2: "ver as informações do funcionário João" -> Access Granted (Green)
  if (lower.includes("funcionário joão") || lower.includes("informações do joão")) {
    return {
      granted: true,
      message: "ACESSO PERMITIDO: Recuperando ficha cadastral do colaborador João Silva. Nível de segurança compatível.",
    };
  }

  // Rule 3: "mostrar um relatório" -> Access Granted (Green)
  if (lower.includes("relatório") || lower.includes("mostrar relatório")) {
    return {
      granted: true,
      message: "ACESSO PERMITIDO: Gerando relatório de performance do setor atual. Carregando dados...",
    };
  }

  // Default fallback
  return {
    granted: true,
    message: "Comando recebido. Processando solicitação no banco de dados central.",
  };
}