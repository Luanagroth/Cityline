import type { ServiceDay, TransportLine, TransportMode } from '@cityline/shared';

export type UiLocale = 'pt-BR' | 'en' | 'es';

export const DEFAULT_LOCALE: UiLocale = 'pt-BR';

export const LOCALE_OPTIONS: Array<{ id: UiLocale; shortLabel: string; label: string }> = [
  { id: 'pt-BR', shortLabel: 'PT-BR', label: 'Portugues' },
  { id: 'en', shortLabel: 'EN', label: 'English' },
  { id: 'es', shortLabel: 'ES', label: 'Espanol' },
];

const dayTypeLabels: Record<UiLocale, Record<ServiceDay, string>> = {
  'pt-BR': { weekday: 'Dia util', saturday: 'Sabado', sunday: 'Domingo' },
  en: { weekday: 'Weekday', saturday: 'Saturday', sunday: 'Sunday' },
  es: { weekday: 'Dia habil', saturday: 'Sabado', sunday: 'Domingo' },
};

const transportModeLabels: Record<UiLocale, Record<TransportMode, string>> = {
  'pt-BR': { urban: 'Urbano', intercity: 'Intermunicipal', ferry: 'Ferry boat' },
  en: { urban: 'Urban', intercity: 'Intercity', ferry: 'Ferry' },
  es: { urban: 'Urbano', intercity: 'Intermunicipal', ferry: 'Ferri' },
};

type UiLabels = {
  signIn: string;
  checking: string;
  signOut: string;
  source: string;
  updated: string;
  activeApi: string;
  safeFallback: string;
  linesMetric: string;
  favoritesMetric: string;
  synchronized: string;
  loading: string;
  searchPlaceholder: string;
  noFavoriteLines: string;
  noFavoriteLinesDescription: string;
  noLinesFound: string;
  noLinesFoundDescription: string;
  useMyLocation: string;
  updateMyLocation: string;
  locating: string;
  signInToUseLocation: string;
  saveMyLocation: string;
  saving: string;
  browserNoGeolocation: string;
  loginBenefit: string;
  chooseDirection: string;
  updatingDirection: string;
  origin: string;
  destination: string;
  averageTime: string;
  mode: string;
  nextDeparture: string;
  dayType: string;
  stopsInDirection: string;
  fare: string;
  consultOperator: string;
  upcomingDepartures: string;
  fullSchedule: string;
  noSchedules: string;
  noSchedulesDescription: string;
  now: string;
  schedules: string;
  plannedSchedule: string;
  peak: string;
  clickMapHint: string;
  availableLines: string;
  activeLine: string;
  yourLocation: string;
  boardingLocationHint: string;
  viewLine: string;
  languageLabel: string;
  productExperienceTitle: string;
  productExperienceDescription: string;
  decoupledFrontend: string;
  decoupledFrontendDescription: string;
  persistedFavorites: string;
  persistedFavoritesDescription: string;
  responsiveMap: string;
  responsiveMapDescription: string;
  ferryTitle: string;
  ferryDescription: string;
  locationDataReview: string;
  locationDataReviewDescription: string;
  locationApproximateDistance: string;
  nearbyLinesCount: string;
  lineWord: string;
  statusRegular: string;
  statusAttention: string;
  statusReduced: string;
};

type UiSections = {
  heroTag: string;
  heroDescription: string;
  linesTitle: string;
  linesDescription: string;
  locationTitle: string;
  locationDescription: string;
  mapTitle: string;
  mapDescription: string;
};

export const uiCopy: Record<UiLocale, { tabs: Record<'all' | 'favorites' | 'ferry' | 'map', string>; filters: Record<'all' | TransportMode, string>; sections: UiSections; labels: UiLabels }> = {
  'pt-BR': {
    tabs: { all: 'Todas as linhas', favorites: 'Favoritas', ferry: 'Ferry boat', map: 'Mapa' },
    filters: { all: 'Tudo', urban: 'Urbano', intercity: 'Intermunicipal', ferry: 'Ferry' },
    sections: {
      heroTag: 'Mobilidade urbana para uso diario',
      heroDescription: 'Linhas, horarios, favoritos e mapa em uma interface mais clara para o deslocamento do dia a dia.',
      linesTitle: 'Linhas e busca',
      linesDescription: 'Encontre a linha ideal, filtre por modal e acompanhe seus favoritos com mais clareza.',
      locationTitle: 'Pontos proximos de voce',
      locationDescription: 'Use sua localizacao para localizar areas de atendimento e corredores proximos.',
      mapTitle: 'Mapa operacional',
      mapDescription: 'Visualize rota, paradas e destaque da linha ativa em um mapa mais facil de ler.',
    },
    labels: {
      signIn: 'Entrar / criar conta',
      checking: 'Verificando...',
      signOut: 'Sair',
      source: 'Fonte',
      updated: 'Atualizado',
      activeApi: 'API ativa',
      safeFallback: 'Fallback seguro',
      linesMetric: 'Linhas',
      favoritesMetric: 'Favoritas',
      synchronized: 'sincronizado',
      loading: 'carregando...',
      searchPlaceholder: 'Busque por linha, numero, bairro ou rota',
      noFavoriteLines: 'Nenhuma linha favoritada',
      noFavoriteLinesDescription: 'Favorite uma linha para montar seu painel pessoal.',
      noLinesFound: 'Nenhuma linha encontrada',
      noLinesFoundDescription: 'Ajuste os filtros ou tente outro termo de busca.',
      useMyLocation: 'Usar minha localizacao',
      updateMyLocation: 'Atualizar minha localizacao',
      locating: 'Localizando...',
      signInToUseLocation: 'Entrar para usar localizacao',
      saveMyLocation: 'Salvar na minha conta',
      saving: 'Salvando...',
      browserNoGeolocation: 'Seu navegador nao suporta geolocalizacao.',
      loginBenefit: 'Sem login voce continua vendo linhas, horarios e mapa. Entre para usar localizacao em tempo real.',
      chooseDirection: 'Escolha o sentido da viagem',
      updatingDirection: 'Atualizando sentido, horarios e mapa...',
      origin: 'Origem',
      destination: 'Destino',
      averageTime: 'Tempo medio',
      mode: 'Modalidade',
      nextDeparture: 'Proxima partida',
      dayType: 'Tipo do dia',
      stopsInDirection: 'Paradas neste sentido',
      fare: 'Tarifa',
      consultOperator: 'Consulte a operadora',
      upcomingDepartures: 'Proximas partidas',
      fullSchedule: 'Grade completa',
      noSchedules: 'Sem horarios para este sentido',
      noSchedulesDescription: 'Nao encontramos partidas cadastradas para o tipo de dia selecionado.',
      now: 'Agora',
      schedules: 'horarios',
      plannedSchedule: 'Horario planejado',
      peak: 'pico',
      clickMapHint: 'Clique na rota ou em uma parada para focar a linha desejada.',
      availableLines: 'Linhas disponiveis',
      activeLine: 'Linha ativa',
      yourLocation: 'Sua localizacao',
      boardingLocationHint: 'Usada como referencia visual no mapa.',
      viewLine: 'ver linha',
      languageLabel: 'Idioma',
      productExperienceTitle: 'Experiencia de produto',
      productExperienceDescription: 'Base preparada para crescer sem perder clareza no uso diario.',
      decoupledFrontend: 'Frontend desacoplado',
      decoupledFrontendDescription: 'Next.js App Router, hooks e services bem definidos.',
      persistedFavorites: 'Favoritos persistidos',
      persistedFavoritesDescription: 'Persistencia local com sincronizacao otimista para backend.',
      responsiveMap: 'Mapa responsivo',
      responsiveMapDescription: 'OpenStreetMap + Leaflet com camada de rota e paradas.',
      ferryTitle: 'Ferry e integracao hidroviaria',
      ferryDescription: 'Travessias publicas com tarifa de referencia e acesso rapido para detalhes.',
      locationDataReview: 'Paradas proximas em revisao',
      locationDataReviewDescription: 'Os dados locais de parada ainda estao sendo refinados. Por enquanto, use esta area apenas como referencia geral.',
      locationApproximateDistance: 'Distancia aproximada',
      nearbyLinesCount: 'linhas proximas',
      lineWord: 'linha',
      statusRegular: 'Operacao regular',
      statusAttention: 'Atencao operacional',
      statusReduced: 'Operacao reduzida',
    },
  },
  en: {
    tabs: { all: 'All lines', favorites: 'Favorites', ferry: 'Ferry', map: 'Map' },
    filters: { all: 'Everything', urban: 'Urban', intercity: 'Intercity', ferry: 'Ferry' },
    sections: {
      heroTag: 'Urban mobility for everyday trips',
      heroDescription: 'Lines, schedules, favorites and map in a clearer dashboard for daily commuting.',
      linesTitle: 'Lines and search',
      linesDescription: 'Find the right line, filter by mode and follow your favorites more easily.',
      locationTitle: 'Nearby stop area',
      locationDescription: 'Use your location to identify nearby service areas and corridors.',
      mapTitle: 'Operational map',
      mapDescription: 'View route, stops and the active line highlight on a cleaner map.',
    },
    labels: {
      signIn: 'Sign in / create account',
      checking: 'Checking...',
      signOut: 'Sign out',
      source: 'Source',
      updated: 'Updated',
      activeApi: 'Live API',
      safeFallback: 'Safe fallback',
      linesMetric: 'Lines',
      favoritesMetric: 'Favorites',
      synchronized: 'synced',
      loading: 'loading...',
      searchPlaceholder: 'Search by line, number, district or route',
      noFavoriteLines: 'No favorite lines yet',
      noFavoriteLinesDescription: 'Favorite a line to build your personal panel.',
      noLinesFound: 'No lines found',
      noLinesFoundDescription: 'Adjust the filters or try another search term.',
      useMyLocation: 'Use my location',
      updateMyLocation: 'Update my location',
      locating: 'Locating...',
      signInToUseLocation: 'Sign in to use location',
      saveMyLocation: 'Save to my account',
      saving: 'Saving...',
      browserNoGeolocation: 'Your browser does not support geolocation.',
      loginBenefit: 'Without login you still see lines, schedules and map. Sign in for real-time location.',
      chooseDirection: 'Choose travel direction',
      updatingDirection: 'Updating direction, schedules and map...',
      origin: 'Origin',
      destination: 'Destination',
      averageTime: 'Average time',
      mode: 'Mode',
      nextDeparture: 'Next departure',
      dayType: 'Day type',
      stopsInDirection: 'Stops in this direction',
      fare: 'Fare',
      consultOperator: 'Check operator',
      upcomingDepartures: 'Upcoming departures',
      fullSchedule: 'Full schedule',
      noSchedules: 'No schedules for this direction',
      noSchedulesDescription: 'We could not find departures for the selected day type.',
      now: 'Now',
      schedules: 'schedules',
      plannedSchedule: 'Planned schedule',
      peak: 'peak',
      clickMapHint: 'Click a route or stop to focus the desired line.',
      availableLines: 'Available lines',
      activeLine: 'Active line',
      yourLocation: 'Your location',
      boardingLocationHint: 'Used as a visual reference on the map.',
      viewLine: 'view line',
      languageLabel: 'Language',
      productExperienceTitle: 'Product experience',
      productExperienceDescription: 'A solid base built to grow without losing daily usability.',
      decoupledFrontend: 'Decoupled frontend',
      decoupledFrontendDescription: 'Next.js App Router, hooks and services with clear responsibilities.',
      persistedFavorites: 'Saved favorites',
      persistedFavoritesDescription: 'Local persistence with optimistic sync to the backend.',
      responsiveMap: 'Responsive map',
      responsiveMapDescription: 'OpenStreetMap + Leaflet with routes and stops.',
      ferryTitle: 'Ferry and waterway integration',
      ferryDescription: 'Public crossings with fare reference and quick access to details.',
      locationDataReview: 'Nearby stops under review',
      locationDataReviewDescription: 'Local stop data is still being refined. For now, use this area only as a general reference.',
      locationApproximateDistance: 'Approximate distance',
      nearbyLinesCount: 'nearby lines',
      lineWord: 'line',
      statusRegular: 'Regular service',
      statusAttention: 'Operational alert',
      statusReduced: 'Reduced service',
    },
  },
  es: {
    tabs: { all: 'Todas las lineas', favorites: 'Favoritas', ferry: 'Ferri', map: 'Mapa' },
    filters: { all: 'Todo', urban: 'Urbano', intercity: 'Intermunicipal', ferry: 'Ferri' },
    sections: {
      heroTag: 'Movilidad urbana para el dia a dia',
      heroDescription: 'Lineas, horarios, favoritos y mapa en una interfaz mas clara para los desplazamientos diarios.',
      linesTitle: 'Lineas y busqueda',
      linesDescription: 'Encuentra la linea ideal, filtra por modo y sigue tus favoritas con mas claridad.',
      locationTitle: 'Area de paradas cercanas',
      locationDescription: 'Usa tu ubicacion para identificar areas de servicio y corredores cercanos.',
      mapTitle: 'Mapa operacional',
      mapDescription: 'Visualiza ruta, paradas y la linea activa en un mapa mas claro.',
    },
    labels: {
      signIn: 'Entrar / crear cuenta',
      checking: 'Verificando...',
      signOut: 'Salir',
      source: 'Fuente',
      updated: 'Actualizado',
      activeApi: 'API activa',
      safeFallback: 'Respaldo seguro',
      linesMetric: 'Lineas',
      favoritesMetric: 'Favoritas',
      synchronized: 'sincronizado',
      loading: 'cargando...',
      searchPlaceholder: 'Busca por linea, numero, barrio o ruta',
      noFavoriteLines: 'No hay lineas favoritas',
      noFavoriteLinesDescription: 'Marca una linea como favorita para crear tu panel personal.',
      noLinesFound: 'No se encontraron lineas',
      noLinesFoundDescription: 'Ajusta los filtros o intenta con otra busqueda.',
      useMyLocation: 'Usar mi ubicacion',
      updateMyLocation: 'Actualizar mi ubicacion',
      locating: 'Ubicando...',
      signInToUseLocation: 'Entrar para usar ubicacion',
      saveMyLocation: 'Guardar en mi cuenta',
      saving: 'Guardando...',
      browserNoGeolocation: 'Tu navegador no soporta geolocalizacion.',
      loginBenefit: 'Sin iniciar sesion sigues viendo lineas, horarios y mapa. Entra para usar ubicacion en tiempo real.',
      chooseDirection: 'Elige el sentido del viaje',
      updatingDirection: 'Actualizando sentido, horarios y mapa...',
      origin: 'Origen',
      destination: 'Destino',
      averageTime: 'Tiempo medio',
      mode: 'Modalidad',
      nextDeparture: 'Proxima salida',
      dayType: 'Tipo de dia',
      stopsInDirection: 'Paradas en este sentido',
      fare: 'Tarifa',
      consultOperator: 'Consultar operadora',
      upcomingDepartures: 'Proximas salidas',
      fullSchedule: 'Horario completo',
      noSchedules: 'Sin horarios para este sentido',
      noSchedulesDescription: 'No encontramos salidas para el tipo de dia seleccionado.',
      now: 'Ahora',
      schedules: 'horarios',
      plannedSchedule: 'Horario previsto',
      peak: 'pico',
      clickMapHint: 'Haz clic en una ruta o parada para enfocar la linea deseada.',
      availableLines: 'Lineas disponibles',
      activeLine: 'Linea activa',
      yourLocation: 'Tu ubicacion',
      boardingLocationHint: 'Se usa como referencia visual en el mapa.',
      viewLine: 'ver linea',
      languageLabel: 'Idioma',
      productExperienceTitle: 'Experiencia del producto',
      productExperienceDescription: 'Base preparada para crecer sin perder claridad en el uso diario.',
      decoupledFrontend: 'Frontend desacoplado',
      decoupledFrontendDescription: 'Next.js App Router, hooks y servicios con responsabilidades claras.',
      persistedFavorites: 'Favoritos guardados',
      persistedFavoritesDescription: 'Persistencia local con sincronizacion optimista al backend.',
      responsiveMap: 'Mapa responsivo',
      responsiveMapDescription: 'OpenStreetMap + Leaflet con rutas y paradas.',
      ferryTitle: 'Ferri e integracion hidroviaria',
      ferryDescription: 'Cruces publicos con referencia de tarifa y acceso rapido a detalles.',
      locationDataReview: 'Paradas cercanas en revision',
      locationDataReviewDescription: 'Los datos locales de paradas todavia se estan refinando. Por ahora, usa esta area solo como referencia general.',
      locationApproximateDistance: 'Distancia aproximada',
      nearbyLinesCount: 'lineas cercanas',
      lineWord: 'linea',
      statusRegular: 'Operacion regular',
      statusAttention: 'Atencion operacional',
      statusReduced: 'Operacion reducida',
    },
  },
};

export const getDayTypeLabel = (locale: UiLocale, dayType: ServiceDay) => dayTypeLabels[locale][dayType];
export const getTransportModeLabel = (locale: UiLocale, mode: TransportMode) => transportModeLabels[locale][mode];

type LocalizedLineCopy = {
  name: string;
  routeLabel: string;
  summary: string;
};

const localizedLineContent: Record<Exclude<UiLocale, 'pt-BR'>, Record<string, LocalizedLineCopy>> = {
  en: {
    '100': {
      name: 'Downtown ↔ Praia Grande',
      routeLabel: 'Central Terminal -> Praia Grande',
      summary: 'High-demand urban line linking the historic center to the beaches with extra departures during peak hours.',
    },
    '101': {
      name: 'Downtown ↔ Vila da Gloria',
      routeLabel: 'Central Terminal -> Vila da Gloria',
      summary: 'Connects downtown to Vila da Gloria and the waterway terminal, useful for urban and ferry connections.',
    },
    '210': {
      name: 'Paulas ↔ Historic Center',
      routeLabel: 'Paulas -> Historic Center',
      summary: 'Residential corridor with solid frequency for daily trips and access to the central commercial area.',
    },
    '310': {
      name: 'Ubatuba ↔ Central Terminal',
      routeLabel: 'Ubatuba -> Central Terminal',
      summary: 'Corridor linking coastal areas, commerce and the urban terminal, including Ubatuba, Capri and Enseada.',
    },
    '330': {
      name: 'Downtown ↔ Capri / Enseada',
      routeLabel: 'Central Terminal -> Capri -> Enseada',
      summary: 'Serves the tourist and residential corridor of Capri with extra trips during beach season and weekends.',
    },
    '610': {
      name: 'Sao Francisco do Sul ↔ Araquari',
      routeLabel: 'Central Terminal -> Araquari',
      summary: 'Intercity line for work and study trips with a connection through BR-280.',
    },
    '620': {
      name: 'Sao Francisco do Sul ↔ Joinville',
      routeLabel: 'Central Terminal -> Joinville',
      summary: 'Intercity connection between Sao Francisco do Sul and Joinville, ideal for work, study and regional integration.',
    },
    'FB-01': {
      name: 'Ferry Laranjeiras ↔ Vila da Gloria',
      routeLabel: 'Laranjeiras ↔ Vila da Gloria',
      summary: 'Public ferry crossing through Babitonga Bay, connecting Laranjeiras and Vila da Gloria.',
    },
    'FB-02': {
      name: 'Ferry Joinville ↔ Vila da Gloria',
      routeLabel: 'Joinville ↔ Vila da Gloria',
      summary: 'Public ferry crossing with regular schedules and regional integration with Vila da Gloria.',
    },
    '0104': {
      name: 'Enseada via Forte / Capri',
      routeLabel: 'Praca Getulio Vargas 272 -> Final Stop Enseada',
      summary: 'Urban branch based on the public Verdes Mares catalog, covering Forte, Capri and access to the beaches of Enseada.',
    },
    '0107': {
      name: 'Enseada via Hospital',
      routeLabel: 'Municipal Hospital -> Final Stop Enseada',
      summary: 'Urban line serving the hospital corridor with a direct connection to the beaches of Enseada.',
    },
    '0116': {
      name: 'IFC',
      routeLabel: 'Historic Center -> IFC Campus',
      summary: 'Service for students and staff connecting the historic center to the IFC campus.',
    },
    '0118': {
      name: 'Forte',
      routeLabel: 'Praca Getulio Vargas 272 -> Estrada do Forte',
      summary: 'Direct link between downtown and the Forte area, with wider coverage along the coastal corridor.',
    },
  },
  es: {
    '100': {
      name: 'Centro ↔ Praia Grande',
      routeLabel: 'Terminal Central -> Praia Grande',
      summary: 'Linea urbana de alta demanda que conecta el centro historico con las playas, con refuerzo en horas pico.',
    },
    '101': {
      name: 'Centro ↔ Vila da Gloria',
      routeLabel: 'Terminal Central -> Vila da Gloria',
      summary: 'Conecta el centro con Vila da Gloria y el terminal hidroviario, util para enlaces urbanos y maritimos.',
    },
    '210': {
      name: 'Paulas ↔ Centro Historico',
      routeLabel: 'Paulas -> Centro Historico',
      summary: 'Corredor residencial con buena frecuencia para desplazamientos diarios y acceso al comercio central.',
    },
    '310': {
      name: 'Ubatuba ↔ Terminal Central',
      routeLabel: 'Ubatuba -> Terminal Central',
      summary: 'Corredor entre zonas costeras, comercio y terminal urbano, incluyendo Ubatuba, Capri y Enseada.',
    },
    '330': {
      name: 'Centro ↔ Capri / Enseada',
      routeLabel: 'Terminal Central -> Capri -> Enseada',
      summary: 'Atiende el eje turistico y residencial de Capri con refuerzo de salidas en temporada de playa y fines de semana.',
    },
    '610': {
      name: 'Sao Francisco do Sul ↔ Araquari',
      routeLabel: 'Terminal Central -> Araquari',
      summary: 'Linea intermunicipal para trabajo y estudio con conexion por la BR-280.',
    },
    '620': {
      name: 'Sao Francisco do Sul ↔ Joinville',
      routeLabel: 'Terminal Central -> Joinville',
      summary: 'Conexion intermunicipal entre Sao Francisco do Sul y Joinville, ideal para trabajo, estudios e integracion regional.',
    },
    'FB-01': {
      name: 'Ferri Laranjeiras ↔ Vila da Gloria',
      routeLabel: 'Laranjeiras ↔ Vila da Gloria',
      summary: 'Cruce hidroviario publico por la Bahia de Babitonga, conectando Laranjeiras y Vila da Gloria.',
    },
    'FB-02': {
      name: 'Ferri Joinville ↔ Vila da Gloria',
      routeLabel: 'Joinville ↔ Vila da Gloria',
      summary: 'Cruce hidroviario con horarios publicos regulares e integracion regional con Vila da Gloria.',
    },
    '0104': {
      name: 'Enseada via Forte / Capri',
      routeLabel: 'Praca Getulio Vargas 272 -> Punto Final Enseada',
      summary: 'Variante urbana basada en el catalogo publico de Verdes Mares, cubriendo Forte, Capri y acceso a las playas de Enseada.',
    },
    '0107': {
      name: 'Enseada via Hospital',
      routeLabel: 'Hospital Municipal -> Punto Final Enseada',
      summary: 'Linea urbana con servicio al corredor hospitalario y conexion directa con las playas de Enseada.',
    },
    '0116': {
      name: 'IFC',
      routeLabel: 'Centro Historico -> Campus IFC',
      summary: 'Servicio para estudiantes y personal con conexion entre el centro historico y el campus del IFC.',
    },
    '0118': {
      name: 'Forte',
      routeLabel: 'Praca Getulio Vargas 272 -> Estrada do Forte',
      summary: 'Conexion directa entre el centro y la region de Forte, con cobertura ampliada en el corredor costero.',
    },
  },
};

export const getLocalizedLineContent = (locale: UiLocale, line: Pick<TransportLine, 'code' | 'name' | 'routeLabel' | 'summary'>) => {
  if (locale === 'pt-BR') {
    return {
      name: line.name,
      routeLabel: line.routeLabel,
      summary: line.summary,
    };
  }

  return localizedLineContent[locale][line.code] ?? {
    name: line.name,
    routeLabel: line.routeLabel,
    summary: line.summary,
  };
};
