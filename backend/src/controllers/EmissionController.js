import Emission from '../models/EmissionModel.js'

export async function createEmission(req, res) {
    try {
        const {month, year, area, electricity, gas, gasusage, wood, priv, waste, meal, meals, renewable, renewunit} = req.body
        const email = req.user.email

        const checkEmission = await Emission.findOne({
            user: email,
            month: month,
            year: year
        })

        if (checkEmission)
            return res.status(400).send('Emission data for this month and year already exists')

        let adjustedElectricity = electricity;
        if (renewable === "yes") {
            adjustedElectricity -= renewunit;
        }
        const electricityEmission = adjustedElectricity * 0.82;

        let gasEmission = 0;
        if (gas === "gas-pipeline") {
            gasEmission = gasusage * 22.73;
        } else if (gas === "gas-cylinder") {
            gasEmission = gasusage * 100;
        }

        const woodEmission = wood * 1.6 * 4;

        const travelEmission = priv / 36.6;

        const wasteEmission = waste * 1.49 * 4;

        let mealEmission = 0;
        if (meal === "vegetarian") {
            mealEmission = meals * 1.75 * 30;
        } else if (meal === "non-vegetarian") {
            mealEmission = meals * 3.5 * 30;
        }

        // Total carbon footprint
        const totalFootprint = electricityEmission + gasEmission + woodEmission + travelEmission + wasteEmission + mealEmission;

        const emission = new Emission({
            month,
            year,
            region: area,
            electricity,
            gas,
            gasusage,
            wood,
            priv,
            waste,
            meal,
            meals,
            renewable,
            renewunit,
            totalemission: totalFootprint,
            user: email
        })
        await emission.save()
        res.status(201).send("Created Successfully")
    }
    catch (err) {
        res.status(500).send(`error: ${err}`)
    }
}

export async function getEmission(req, res) {
    try {
        //const email = req.body.email
        const {month, year} = req.body
        const email = req.user.email

        const emission = await Emission.findOne({
            user: email,
            month: month,
            year: year
        })
        res.status(200).json(emission)
    }
    catch (err) {
        res.status(500).send("Error finding the emission")
    }
}

export async function getALlEmissions(req, res) {
    try {
        const emissions = await Emission.find({})
        res.status(200).json(emissions)
    }
    catch (err) {
        res.status(500).send("Error finding emissions")
    }
}

export async function getLast12Emissions(req, res) {
    try {
        const email = req.user.email
        const emissions = await Emission.find({user: email}).sort({createdAt: -1}).limit(12).exec()

        res.status(200).send(emissions)
    }
    catch (err) {
        res.status(500).send(`error: ${err}`)
    }
}
