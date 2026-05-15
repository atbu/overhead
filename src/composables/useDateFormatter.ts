export function formatToAviationDate(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    return formatter.format(date)
            .replaceAll(" ", "")
            .replaceAll(",", "")
            .replaceAll(":", "")
            .toUpperCase()
            + 'Z';
}
