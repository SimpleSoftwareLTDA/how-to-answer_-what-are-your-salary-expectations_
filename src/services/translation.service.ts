import { Injectable, signal, computed, Signal } from '@angular/core';

type Language = 'en' | 'pt';

const translations = {
  en: {
    title: 'How to Answer: What are your salary expectations?',
    subtitle: 'Discover salary insights with real-world data.',
    dataSourceNotice: 'Real-world data from Glassdoor, based on anonymous salaries disclosed by real employees.',
    jobTitleLabel: 'Job Title',
    jobTitlePlaceholder: 'e.g., Senior Product Manager',
    companyLabel: 'Company',
    companyPlaceholder: 'e.g., Spotify',

    searchButton: 'Search Salaries',
    searchingButton: 'Searching...',
    noResultsTitle: 'No Results Yet',
    noResultsSubtitle: 'Your search results will appear here.',
    initialStateTitle: 'Ready to Search?',
    initialStateSubtitle: 'Enter a job title and location to begin.',
    baseSalaryLabel: 'Base Salary',
    salaryRangeLabel: 'Monthly Salary',
    errorTitle: 'Oops! Something went wrong.',
    errorEmptySearch: 'Please enter a job title or location to search.',
    errorNoResults: 'No results found for your query. Try being more specific or broader.',
    errorApi: 'An error occurred while fetching data. The API might be down or your API key could be invalid.',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'How do I answer "What are your salary expectations?"',
    faq1A: 'The best approach is to provide a range based on market research. Use this tool to find real-world data and negotiate with confidence.',
    faq2Q: 'Why use real-world data for negotiations?',
    faq2A: 'Data-driven negotiations are more objective and persuasive. Knowing the market value for your role and location gives you leverage.',
  },
  pt: {
    title: 'Como Responder: Qual é a sua expectativa salarial?',
    subtitle: 'Descubra informações sobre salários com dados do mundo real.',
    dataSourceNotice: 'Dados do mundo real do Glassdoor, baseados em salários anônimos divulgados por funcionários reais.',
    jobTitleLabel: 'Cargo',
    jobTitlePlaceholder: 'ex: Gerente de Produto Sênior',
    companyLabel: 'Empresa',
    companyPlaceholder: 'ex: Spotify',

    searchButton: 'Pesquisar Salários',
    searchingButton: 'Pesquisando...',
    noResultsTitle: 'Nenhum Resultado',
    noResultsSubtitle: 'Os resultados da sua pesquisa aparecerão aqui.',
    initialStateTitle: 'Pronto para Pesquisar?',
    initialStateSubtitle: 'Digite um cargo e local para começar.',
    baseSalaryLabel: 'Salário Base',
    salaryRangeLabel: 'Salário Mensal',
    errorTitle: 'Opa! Algo deu errado.',
    errorEmptySearch: 'Por favor, insira um cargo ou local para pesquisar.',
    errorNoResults: 'Nenhum resultado encontrado para sua busca. Tente ser mais específico ou mais amplo.',
    errorApi: 'Ocorreu um erro ao buscar os dados. A API pode estar fora do ar ou sua chave de API pode ser inválida.',
    faqTitle: 'Perguntas Frequentes',
    faq1Q: 'Como respondo "Qual é a sua expectativa salarial?"',
    faq1A: 'A melhor abordagem é fornecer uma faixa baseada em pesquisa de mercado. Use esta ferramenta para encontrar dados reais e negociar com confiança.',
    faq2Q: 'Por que usar dados reais para negociações?',
    faq2A: 'Negociações baseadas em dados são mais objetivas e persuasivas. Saber o valor de mercado para seu cargo e local te dá vantagem.',
  }

};

type TranslationKey = keyof (typeof translations)['en'];

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  language = signal<Language>('en');

  setLanguage(lang: Language): void {
    this.language.set(lang);
  }

  translate(key: TranslationKey): Signal<string> {
    return computed(() => translations[this.language()][key] || key);
  }

  instant(key: TranslationKey): string {
    return translations[this.language()][key] || key;
  }
}
