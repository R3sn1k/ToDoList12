import { config } from 'dotenv'
import { createClient } from '@sanity/client'

config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function seedData() {
  try {
    console.log('Seeding test data...')

    // Create test users
    const user1 = await client.create({
      _type: 'user',
      email: 'admin@test.com',
      username: 'admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    })
    console.log('Created admin user:', user1._id)

    const user2 = await client.create({
      _type: 'user',
      email: 'user@test.com',
      username: 'user',
      role: 'user',
      createdAt: new Date().toISOString()
    })
    console.log('Created regular user:', user2._id)

    // Create test todos
    const todo1 = await client.create({
      _type: 'todo',
      title: 'Prva naloga',
      description: 'To je testna naloga za admin uporabnika',
      completed: false,
      user: {
        _type: 'reference',
        _ref: user1._id
      },
      createdAt: new Date().toISOString()
    })
    console.log('Created todo for admin:', todo1._id)

    const todo2 = await client.create({
      _type: 'todo',
      title: 'Druga naloga',
      description: 'To je testna naloga za navadnega uporabnika',
      completed: false,
      user: {
        _type: 'reference',
        _ref: user2._id
      },
      createdAt: new Date().toISOString()
    })
    console.log('Created todo for user:', todo2._id)

    const todo3 = await client.create({
      _type: 'todo',
      title: 'Končana naloga',
      description: 'Ta naloga je že dokončana',
      completed: true,
      user: {
        _type: 'reference',
        _ref: user1._id
      },
      createdAt: new Date().toISOString()
    })
    console.log('Created completed todo:', todo3._id)

    console.log('Seeding completed successfully!')
    console.log('Test credentials:')
    console.log('Admin: admin@test.com (password: any)')
    console.log('User: user@test.com (password: any)')

  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

seedData()