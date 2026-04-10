const { createShipment, getAllShipments, getShipmentById } = require("../services/firestoreService");

exports.createShipment = async(req, res) => {
    try{
        const { origin, destination, priority } = req.body;

        if(!origin || !destination || !priority){
            throw new Error("Origin, destination and priority are required");
        }

        const response = await createShipment(origin, destination, priority);

        res.status(201).json(response);
        
    }catch(err){
        res.error("Error creating shipment:", err);
        res.status(500).json({ error: err.message });
    }
}

exports.getAllShipments = async(req, res) => {
    try{
        const shipments = await getAllShipments();
        res.json(shipments);


    }catch(err){
        res.error("Error fetching shipments:", err);
    }
}

exports.getShipmentById = async(req, res) => {
    try{
        const shipmentId  = req.params.id;
        if(!shipmentId){
            throw new Error("Shipment ID is required");
        }

        const shipment = await getShipmentById(shipmentId);
        if(!shipment){
            throw new Error("Shipment not found");
        }
        res.json(shipment);

    }catch(err){
        res.error("Error fetching shipment:", err);
    }
}

exports.updateShipmentStatus = async(req, res) => {
    try{
        const shipmentId  = req.params.id;

        const { status } = req.body;

        if(!shipmentId || !status){
            throw new Error("Shipment ID and status are required");
        }

        if(!["pending", "in_transit", "delivered", "cancelled"].includes(status)){
            throw new Error("Invalid status");
        }

        const updateData = {
            status,
            updatedAt: new Date(),
        }
        const response = await updateShipmentStatus(shipmentId, updateData);

        res.json(response);

    }catch(err){
        res.error("Error updating shipment:", err);
    }
}