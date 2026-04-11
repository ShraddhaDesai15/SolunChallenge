const validate_shipment = (req, res, next) => {
    try {
        const { origin, destination, priority } = req.body;

     
        if (!origin || !destination || !priority) {
            return res.status(400).json({
                error: "Missing required fields: origin, destination, priority"
            });
        }


        if (!["high", "medium", "low"].includes(priority)) {
            return res.status(400).json({
                error: "Invalid priority value. Must be 'high', 'medium', or 'low'"
            });
        }

       
        if (
            typeof origin.lat !== "number" ||
            typeof origin.lng !== "number" ||
            typeof destination.lat !== "number" ||
            typeof destination.lng !== "number"
        ) {
            return res.status(400).json({
                error: "Origin and destination lat and lng must be numbers"
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const validate_maps = (req, res, next) => {
    try {
        const { origin, destination } = req.body;

     
        if (!origin || !destination) {
            return res.status(400).json({
                error: "Missing required fields: origin, destination"
            });
        }

       
        if (
            typeof origin.lat !== "number" ||
            typeof origin.lng !== "number" ||
            typeof destination.lat !== "number" ||
            typeof destination.lng !== "number"
        ) {
            return res.status(400).json({
                error: "Origin and destination lat and lng must be numbers"
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {validate_shipment, validate_maps};