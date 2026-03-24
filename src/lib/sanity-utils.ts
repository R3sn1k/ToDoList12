import { client } from "@/lib/sanity"

export interface SanityUser {
  _id: string
  email: string
  username: string
  passwordHash?: string
  role: "user" | "admin"
  createdAt: string
}

export interface SanityTodo {
  _id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  user: {
    _id: string
    username: string
    email: string
  }
}

interface CreateUserInput {
  email: string
  username: string
  passwordHash: string
  role?: "user" | "admin"
}

interface UpdateUserInput {
  email?: string
  username?: string
}

interface CreateTodoInput {
  title: string
  description?: string
  userId: string
}

type TodoUpdates = {
  title?: string
  description?: string
  completed?: boolean
}

const userProjection = `{
  _id,
  email,
  username,
  passwordHash,
  role,
  createdAt
}`

const todoProjection = `{
  _id,
  title,
  description,
  completed,
  createdAt,
  user->{
    _id,
    username,
    email
  }
}`

export async function getUserByEmail(email: string): Promise<SanityUser | null> {
  return client.fetch(
    `*[_type == "user" && lower(email) == lower($email)][0] ${userProjection}`,
    { email }
  )
}

export async function getUserById(id: string): Promise<SanityUser | null> {
  return client.fetch(`*[_type == "user" && _id == $id][0] ${userProjection}`, { id })
}

export async function getUsers(): Promise<SanityUser[]> {
  return client.fetch(`*[_type == "user"] | order(createdAt desc) ${userProjection}`)
}

export async function createUser(input: CreateUserInput): Promise<SanityUser> {
  const createdAt = new Date().toISOString()

  const document = await client.create({
    _type: "user",
    email: input.email,
    username: input.username,
    passwordHash: input.passwordHash,
    role: input.role ?? "user",
    createdAt,
  })

  return {
    _id: document._id,
    email: input.email,
    username: input.username,
    passwordHash: input.passwordHash,
    role: input.role ?? "user",
    createdAt,
  }
}

export async function updateUser(id: string, updates: UpdateUserInput): Promise<SanityUser> {
  await client.patch(id).set(updates).commit()

  const updatedUser = await getUserById(id)
  if (!updatedUser) {
    throw new Error("User not found after update")
  }

  return updatedUser
}

export async function getTodos(): Promise<SanityTodo[]> {
  return client.fetch(`*[_type == "todo"] | order(createdAt desc) ${todoProjection}`)
}

export async function getTodosByUser(userId: string): Promise<SanityTodo[]> {
  return client.fetch(
    `*[_type == "todo" && user._ref == $userId] | order(createdAt desc) ${todoProjection}`,
    { userId }
  )
}

export async function createTodo(input: CreateTodoInput): Promise<SanityTodo> {
  const createdAt = new Date().toISOString()

  const document = await client.create({
    _type: "todo",
    title: input.title,
    description: input.description ?? "",
    completed: false,
    createdAt,
    user: {
      _type: "reference",
      _ref: input.userId,
    },
  })

  const todo = await client.fetch<SanityTodo>(
    `*[_type == "todo" && _id == $id][0] ${todoProjection}`,
    { id: document._id }
  )

  if (!todo) {
    throw new Error("Todo not found after creation")
  }

  return todo
}

export async function updateTodo(id: string, updates: TodoUpdates): Promise<SanityTodo> {
  await client.patch(id).set(updates).commit()

  const todo = await client.fetch<SanityTodo>(
    `*[_type == "todo" && _id == $id][0] ${todoProjection}`,
    { id }
  )

  if (!todo) {
    throw new Error("Todo not found after update")
  }

  return todo
}

export async function deleteTodo(id: string): Promise<void> {
  await client.delete(id)
}
