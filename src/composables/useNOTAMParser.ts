export interface ParsedNOTAM {
    number: string,
    latitude: number,
    longitude: number,
    radiusInMetres: number,
    itemE: string,
    lowerLimit: number,
    upperLimit: number,
    start: Date,
    end: Date
}

function parseCoordinates(coordinates: string): {latitude: number, longitude: number} {
    const latitudeString = coordinates.slice(0, 5);
    const longitudeString = coordinates.slice(5, 11);

    const latitudeDegrees = parseInt(latitudeString.slice(0, 2));
    const latitudeMinutes = parseInt(latitudeString.slice(2, 4));
    const isLatitudeNorth = latitudeString[4] == 'N';
    const decimalisedLatitude = latitudeDegrees + (latitudeMinutes / 60);

    const longitudeDegrees = parseInt(longitudeString.slice(0, 3));
    const longitudeMinutes = parseInt(longitudeString.slice(3, 5));
    const isLongitudeEast = longitudeString[5] == 'E';
    const decimalisedLongitude = longitudeDegrees + (longitudeMinutes / 60);

    return {
        latitude: isLatitudeNorth ? decimalisedLatitude : -decimalisedLatitude,
        longitude: isLongitudeEast ? decimalisedLongitude : -decimalisedLongitude
    };
}

function convertRadiusToMetres(radiusNauticalMiles: number): number {
    const METRES_PER_NM = 1852;
    return radiusNauticalMiles * METRES_PER_NM;
}

function twoDigitYearToFullYear(twoDigitYear: string): number {
    const twoDigitYearNum = parseInt(twoDigitYear);

    const currentYear = new Date().getFullYear().toString();
    const currentYearLastTwoDigits = parseInt(currentYear.slice(-2));
    const currentYearFirstTwoDigits = parseInt(currentYear.slice(0, 2));

    let targetYear: number;
    if (twoDigitYearNum <= currentYearLastTwoDigits) {
        targetYear = parseInt(currentYearFirstTwoDigits.toString() + twoDigitYear);
    } else {
        targetYear = parseInt((currentYearFirstTwoDigits-1).toString() + twoDigitYear);
    }

    return targetYear;
}

export function parseNOTAMs(document: Document): ParsedNOTAM[] {
    let output: ParsedNOTAM[] = [];

    const notams = [
        ...Array.from(document.getElementsByTagName("Notam"))
    ];

    notams.forEach((notam: Element) => {
        const getText = (tag: string) =>
            notam.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';

        const coordinatesString = getText("Coordinates");
        const radius: number = parseInt(getText("Radius"));

        // For now, ignore NOTAMs that are too big or don't have a radius for visibility, we can sort this later
        // TODO
        if (radius == 0 || radius >= 20) {
            return;
        }

        const {latitude, longitude} = parseCoordinates(coordinatesString);
        const radiusInMetres = convertRadiusToMetres(radius);

        // TODO turn this into a nice function
        const startString = getText("StartValidity");
        const startYear = twoDigitYearToFullYear(startString.slice(0, 2));
        const startMonth = parseInt(startString.slice(2, 4)) - 1;
        const startDay = parseInt(startString.slice(4, 6));
        const startHours = parseInt(startString.slice(6, 8));
        const startMinutes = parseInt(startString.slice(8, 10));
        const startDate = new Date(startYear, startMonth, startDay, startHours, startMinutes);

        const endString = getText("EndValidity");
        const endYear = twoDigitYearToFullYear(endString.slice(0, 2));
        const endMonth = parseInt(endString.slice(2, 4)) - 1;
        const endDay = parseInt(endString.slice(4, 6));
        const endHours = parseInt(endString.slice(6, 8));
        const endMinutes = parseInt(endString.slice(8, 10));
        console.log(`${endString} ${endYear} ${endMonth} ${endDay} ${endHours} ${endMinutes}`)
        const endDate = new Date(endYear, endMonth, endDay, endHours, endMinutes);

        const currentNOTAM: ParsedNOTAM = {
            number: getText("Number"),
            latitude,
            longitude,
            radiusInMetres,
            itemE: getText("ItemE"),
            lowerLimit: parseInt(getText("Lower")) * 100, // values in feet
            upperLimit: parseInt(getText("Upper")) * 100, // same as above
            start: startDate,
            end: endDate
        }

        output.push(currentNOTAM);
    });

    return output;
}
