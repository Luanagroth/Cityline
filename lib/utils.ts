// Funções utilitárias para formatação e manipulação de dados

export function formatTime(time: string): string {
  return time;
}

export function getNextBuses(times: string[], currentTime: Date = new Date()): string[] {
  const current = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  return times
    .map((time) => {
      const parts = time.split(':').map(Number) as [number, number];
      const timeInMinutes = (parts[0] || 0) * 60 + (parts[1] || 0);
      return timeInMinutes;
    })
    .filter((timeInMinutes) => timeInMinutes >= current)
    .slice(0, 3)
    .map((timeInMinutes) => {
      const hoursVal = Math.floor(timeInMinutes / 60);
      const minutesVal = timeInMinutes % 60;
      return `${String(hoursVal).padStart(2, '0')}:${String(minutesVal).padStart(2, '0')}`;
    });
}

export function getTimeUntilNextBus(busTime: string, currentTime: Date = new Date()): string {
  const timeParts = busTime.split(':').map(Number) as [number, number];
  const busHours = timeParts[0] || 0;
  const busMinutes = timeParts[1] || 0;
  const busTotalMinutes = busHours * 60 + busMinutes;
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  let diffMinutes = busTotalMinutes - currentTotalMinutes;
  
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Próximo dia
  }

  if (diffMinutes === 0) return 'Agora';
  if (diffMinutes < 1) return 'Saindo';
  if (diffMinutes < 60) return `Sai em ${diffMinutes}min`;
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) return `Sai em ${hours}h`;
  return `Sai em ${hours}h ${minutes}min`;
}

export function getDayType(date: Date = new Date()): 'weekday' | 'saturday' | 'sunday' {
  const day = date.getDay();
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

export function getDistanceKm(distance: number): string {
  return `${distance} km`;
}

export function getEstimatedTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
