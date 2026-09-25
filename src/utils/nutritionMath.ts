// Calcula a meta de água (retorna em mililitros)
export function calculateWaterGoal(peso: number): number {
  if (!peso || peso <= 0) return 0;
  return Math.round(peso * 35);
}

// Calcula o IMC
export function calculateIMC(peso: number, alturaCm: number): number {
  if (!peso || !alturaCm) return 0;
  const alturaMetros = alturaCm / 100;
  const imc = peso / (alturaMetros * alturaMetros);
  // Retorna com 1 casa decimal (ex: 22.5)
  return Math.round(imc * 10) / 10;
}

// Calcula a meta diária de calorias
export function calculateCaloricGoal(
  peso: number,
  alturaCm: number,
  idade: number,
  sexo: string,
  objetivo: string
): number {
  if (!peso || !alturaCm || !idade || !sexo) return 0;

  // 1. Cálculo da Taxa Metabólica Basal (Mifflin-St Jeor)
  let tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade);
  
  if (sexo === 'M') {
    tmb = tmb + 5;
  } else {
    tmb = tmb - 161;
  }

  // 2. Multiplicador de Atividade (Assumindo levemente ativo como padrão inicial)
  const get = tmb * 1.2;

  // 3. Ajuste pelo Objetivo
  let metaCalorica = get;
  
  if (objetivo === 'perder') {
    metaCalorica = get - 500; // Déficit saudável
  } else if (objetivo === 'ganhar') {
    metaCalorica = get + 300; // Superávit leve para massa
  } // Se for 'manter', não muda

  // 4. Trava de Segurança Médica (Nunca recomendar menos de 1200 kcal)
  if (metaCalorica < 1200) {
    metaCalorica = 1200;
  }

  // Retorna arredondado, sem casas decimais
  return Math.round(metaCalorica);
}