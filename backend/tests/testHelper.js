const { User, Club, Equipment, Membership, Paddle } = require('../models/index')

const initialUsers = [
  {
    username: 'jukka',
    passwordhash: '1234',
    name: 'Jukka Ponsiluoma',
    email: 'jukka.ponsiluoma@example.com'
  },
  {
    username: 'siiri',
    passwordhash: 'testpasswordhash',
    name: 'Siiri Keränen',
    email: 'siiri.keranen@example.com'
  },
  {
    username: 'viivi',
    passwordhash: 'testpasswordhash2',
    name: 'Viivi Linkonen',
    email: 'viivi.linkonen@example.com'
  },
  {
    username: 'venla',
    passwordhash: 'testpasswordhash3',
    name: 'Venla Soininen',
    email: 'venla.soininen@example.com'
  }
]

const initialClubs = [
  {
    name: 'Melaveikot',
    location: 'Ruoholahti',
    email: 'melaveikot@example.com'
  },
  {
    name: 'Merimelojat',
    location: 'Test Location 1',
    email: 'merimelojat@example.com'
  },
  {
    name: 'Kaarinan melojat',
    location: 'Test Location 2',
    email: 'kaarinan.melojat@example.com'
  }
]

const initialMemberships = [
  {
    userId: 1,
    clubId: 1,
    role: 'superadmin'
  },
  {
    userId: 2,
    clubId: 1,
    role: 'user'
  },
  {
    userId: 3,
    clubId: 2,
    role: 'admin'
  },
  {
    userId: 4,
    clubId: 2,
    role: 'user'
  }
]

const initialEquipments = [
  {
    name: 'kayak 1',
    type: 'kayak',
    length: 4.5,
    weight: 100,
    maxWeight: 150,
    yearBought: 2020,
    price: 1000,
    clubId: 1
  },
  {
    name: 'canoe 1',
    type: 'canoe',
    length: 4.5,
    weight: 100,
    maxWeight: 150,
    yearBought: 2020,
    price: 1000,
    clubId: 1
  },
  {
    name: 'paddle 1',
    type: 'paddle',
    length: 2.5,
    weight: 10,
    maxWeight: 15,
    yearBought: 2020,
    price: 100,
    clubId: 1
  },
  {
    name: 'seycat 1',
    type: 'kayak',
    length: 4.5,
    weight: 100,
    maxWeight: 150,
    yearBought: 2020,
    price: 1000,
    clubId: 2
  },
  {
    name: 'other 1',
    type: 'other',
    length: 4.5,
    weight: 100,
    maxWeight: 150,
    yearBought: 2020,
    price: 1000,
    clubId: 2
  },
  {
    name: 'other 2',
    type: 'other',
    length: 4.5,
    weight: 100,
    maxWeight: 150,
    yearBought: 2020,
    price: 1000,
    clubId: 2
  },
  {
    name: 'canoe master',
    type: 'canoe',
    length: 4.5,
    weight: 100,
    maxWeight: 150,
    yearBought: 2020,
    price: 1000,
    clubId: 2
  }
]

const initialPaddles = [
  {
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 2),
    info: 'Käärmeluotojen kierros',
    ended: true,
    userId: 1,
    clubId: 1,
    equipmentId: 2
  },
  {
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000 * 60 * 60 * 2), // 2 days ago + 2 hours
    info: 'Lauttasaaren kierros',
    ended: true,
    userId: 1,
    clubId: 1,
    equipmentId: 2
  },
  {
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000 * 60 * 60 * 2), // 2 days ago + 2 hours
    info: '',
    ended: false,
    userId: 2,
    clubId: 1,
    equipmentId: 1
  }
]

const usersInDb = async () => {
  const users = await User.findAll({})
  return users.map(u => u.toJSON())
}

const clubsInDb = async () => {
  const clubs = await Club.findAll({})
  return clubs.map(c => c.toJSON())
}

const membershipsInDb = async () => {
  const memberships = await Membership.findAll({})
  return memberships.map(m => m.toJSON())
}

module.exports = {
  initialUsers,
  initialClubs,
  initialMemberships,
  initialEquipments,
  initialPaddles,
  usersInDb,
  clubsInDb,
  membershipsInDb
}