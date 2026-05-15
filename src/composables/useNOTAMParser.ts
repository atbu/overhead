export interface ParsedNOTAM {
    number: string,
    latitude: number,
    longitude: number,
    radiusInMetres: number,
    itemE: string,
    lowerLimit: number,
    upperLimit: number
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

        const currentNOTAM: ParsedNOTAM = {
            number: getText("Number"),
            latitude,
            longitude,
            radiusInMetres,
            itemE: getText("ItemE"),
            lowerLimit: parseInt(getText("Lower")) * 100, // values in feet
            upperLimit: parseInt(getText("Upper")) * 100 // same as above
        }

        output.push(currentNOTAM);
    });

    return output;
}
