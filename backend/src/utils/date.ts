export function parseDateFromDDMMYYYY(date: string): Date {
    const [day, month, year ] = date.split('/')

    if (!day || !month || !year) {
        throw new Error('Invalid date format. Expected dd/mm/yyyy')
    }

    const parsed = new Date(Number(year), Number(month) - 1, Number(day))

    if (isNaN(parsed.getTime())) {
        throw new Error('Invalid date values')
    }

    return parsed
}