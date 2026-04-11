async function getRoute(origin, destination){
    try{
        const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&alternatives=true&geometries=polyline`;
        const response = await fetch(url);
        const data = await response.json();


    }
    catch(err){
        console.error("Error fetching maps data:", err);
        return null;
    }
}