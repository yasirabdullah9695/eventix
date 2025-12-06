const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LeaderPosition = require('./models/leaderPositionModel');
const House = require('./models/houseModel');

dotenv.config();

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {});
  
  // Clear existing data
  await LeaderPosition.deleteMany({});
  await House.deleteMany({});

  // Create houses
  const houseNames = ['Prithvi', 'Tejas', 'Arihan', 'Aakash', 'Vayu', 'Agni' ];
  const createdHouses = await Promise.all(houseNames.map(name =>
    House.create({
      name: name,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      logo_url: `/uploads/${name.toLowerCase()}-logo.png`, // Placeholder
      description: `House of ${name}.`,
    })
  ));
  console.log('Houses created:', createdHouses.map(h => h.name).join(', '));

  let positionsToCreate = [];

  // Global Positions
  const globalPositions = [
    { title: 'President', description: 'The leader of the student body.', priority: 1 },
    { title: 'Vice President', description: 'The second in command.', priority: 2 },
  ];
  positionsToCreate.push(...globalPositions);

  // House-Specific Positions
  const houseSpecificPositionTitles = [
    { title: 'Secretary', priority: 3 },
    { title: 'Treasurer', priority: 4 },
    { title: 'Cultural Secretary', priority: 5 },
    { title: 'Sports Captain', priority: 6 },
  ];

  createdHouses.forEach(house => {
    houseSpecificPositionTitles.forEach(pos => {
      positionsToCreate.push({
        title: `${pos.title} - ${house.name}`,
        description: `${pos.title} for ${house.name} House.`,
        priority: pos.priority, // You might want to adjust priority for house-specific
        house_id: house._id,
      });
    });
  });

  await LeaderPosition.insertMany(positionsToCreate);
  console.log('Leader Positions seeded!');
  mongoose.connection.close();
};

seedDB();