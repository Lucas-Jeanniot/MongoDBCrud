const {MongoClient} = require('mongodb');

async function main(){
 
    const client = new MongoClient(uri);
    try{
        await client.connect(); //await waits for the connection to succeed before continuing

    /* -----------FUNCTION CALL TO CREATE COLLECTIONS --------------- */    
    await createPhone(
        client,[
            {brand: "Samsung", model: "G7", price: 500},
            {brand: "Apple", model: "Iphone 10", price: 800},
            {brand: "Apple", model: "Iphone 12", price: 1200},
            {brand: "Samsung", model: "S9", price: 1100},
            {brand: "Huawei", model: "P50 Pro", price: 800},
            {brand: "Samsung", model: "S11", price: 1200},
            {brand: "Nokia", model: "G10",price: 600},
            {brand: "Apple", model: "Iphone 5",price: 250},
        ]); 
    
    await createCustomers(
        client,[
            {title: "Mr", name: "Chris", surname: "Gorty", mobile: 0838842919, email: "chris67@gmail.com", addressLine1: "5 Rocksmith Avenue", addressLine2: "Pembroke", town: "Maynooth", county: "Kildare"},
            {title: "Ms", name: "Anna",  surname: "Gorty",mobile: 084555097, email: "anna450@gmail.com", addressLine1: "18 Beaufield Grove",  addressLine2: "The Lanes", town: "Kilcock", county: "Kildare"},
            {title: "Mrs", name: "Laura", surname: "McNally",mobile: 08445920, email: "mcnally54@gmail.com", addressLine1: "20 Fortree Side", addressLine2: "Zaun", town: "Celondia", county: "Emeris"},
            {title: "Mr", name: "Medivh", surname: "The Almighty", mobile: 085666950, email: "medivh@wizardmail.com", addressLine1: "Karazhan", addressLine2: '', town: "Wailing Canyon", county: "Eastern Kingdom"},
            {title: "Warchief", name: "Thrall", surname: "",mobile: 081472394, email: "thrall@elements.com", addressLine1: "Valley of Honor", addressLine2: "Orgrimmar", town: "Durotar", county: "Kalimdor"}
        ]); 

     /* ------------- FUNCTION CALL TO FIND ONE PHONE BASED ON BRAND ------------- */
    await findOnePhone(client, 'Huawei');

      /* ------- FUNCTION CALL TO FIND MANY PHONES BASED ON BRANDS ------------- */
    await findManyPhone(client,'Samsung');

     /* --------- FUNCTION TO UPDATE PHONES --------------------- */
    await findOnePhone(client, "Samsung");
    await updatePhone(client, "Motorola", {brand: "Samsung"}); 
    await findOnePhone(client, "Samsung"); 

    /* --------- FUNCTION TO UPSERT PHONES --------------------- */
    await findOnePhone(client, "Microsoft");
    await upsertPhone(client, "Microsoft", {brand: "Microsoft", model: "Windows Phone", price: 500,});

     /* FUNCTION TO ADD NEW FIELD TO DB */
     await updatePhoneAvailability(client);

    /* -------- FUNCTION TO DELETE PHONE ---------------- */
    await deletePhone(client, "Microsoft");
     
    } catch (e){
        console.error(e);
    } finally {
        await  client.close();
    }
}

main().catch(console.err);



// Function to create a listing populated with hardcoded data
async function createPhone(client, newPhone){
    const result = await client.db("Phone_Store").collection("PhoneInventory").insertMany(newPhone);
    console.log(`${result.insertedCount} new Phone(s) added with the following IDs: `);
    console.log(result.insertedIds);
 } 

async function createCustomers(client, newCustomer){
    const result = await client.db("Phone_Store").collection("Customers").insertMany(newCustomer);
    console.log(`${result.insertedCount} new customer(s) added with the following IDs: `);
    console.log(result.insertedIds);
}

//Function to find one phone based on brand
async function findOnePhone(client, nameOfPhone){ 
    const result = await client.db("Phone_Store").collection("PhoneInventory").findOne({brand: nameOfPhone});
     if(result){
         console.log(`Found a phone in collection with the name '${nameOfPhone}':`);
         console.log(result);
     }else{
         console.log(`No phone found with the name '${nameOfPhone}'`);
     }
 }
 
 async function findManyPhone(client, nameOfBrand){
    const cursor = client.db("Phone_Store").collection("PhoneInventory").find({brand: nameOfBrand});
    const results = await cursor.toArray();

    if(results.length>0){
        console.log(`Found phone(s) with this brand '${nameOfBrand}':`);
        results.forEach((result, i) => {
            console.log();
            console.log(`${i + 1}. brand: ${result.brand}`);
            console.log(` _id: ${result._id}`);
            console.log(` model: ${result.model}`);
            console.log(` price: ${result.price}`);
        })
    }else{
        console.log(`No phone(s) found with the name '${nameOfBrand}'`);
    }
}

// FUNCTION TO UPDATE ONE PHONE
async function updatePhone(client, phone, updatedPhone){
    const result = await client.db("Phone_Store").collection("PhoneInventory").updateOne(
        { brand: phone},
        { $set: updatedPhone}
    );
    console.log(`${result.matchedCount} phone(s) matched the update criteria`)
    console.log(`${result.modifiedCount} phone(s) were updated`);
}

// FUNCTION TO UPSERT (UPDATE OR ADD) PHONE TO COLLECTION
async function upsertPhone(client, phone, updatedPhone){
    const result = await client.db("Phone_Store").collection("PhoneInventory").updateOne(
        { brand: phone},
        { $set: updatedPhone},
        {upsert:true}
    );
    console.log(`${result.matchedCount} phone(s) matched the query criteria`);

    if(result.upsertedCount > 0){
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    }else{
        console.log(`${result.modifiedCount} phone(s) were updated`);
    }
}


// FUNCTION TO UPDATE DATABASE WITH NEW FIELD FOR ITEMS (in this case, availiblity)
async function updatePhoneAvailability(client){
    const result = await client.db("Phone_Store").collection("PhoneInventory")
         .updateMany({ availbility: {$exists: false}},
             {$set: {availiblity: "Yes"}});
     console.log(`${result.matchedCount} phone(s) matched the update query`);
     console.log(`${result.modifiedCount} phone(s) were updated`);
 }
 
// FUNCTION TO DELETE PHONE
async function deletePhone(client, nameOfPhone){
   const result = await client.db("Phone_Store").collection("PhoneInventory")
        .deleteOne({brand: nameOfPhone});
    console.log(`${result.deletedCount} document(s) were deleted.`);
}









