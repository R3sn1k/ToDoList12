import { client } from "@/lib/sanity"

export interface SanityUser {
  _id: string
  email: string
  username: string
  passwordHash?: string
  recoveryCodeHash?: string
  role: "user" | "admin"
  createdAt: string
}

export interface SanitySubtask {
  _key?: string
  title: string
  completed: boolean
}

export interface SanityTodo {
  _id: string
  title: string
  description?: string
  completed: boolean
  priority: boolean
  priorityRank: number
  dueDate?: string
  completedAt?: string
  createdAt: string
  subtasks: SanitySubtask[]
  user: {
    _id: string
    username: string
    email: string
  }
  createdBy: {
    _id: string
    username: string
    email: string
  }
  isNotificationTask: boolean
}

export interface SanityTaskInvitation {
  _id: string
  email: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
  respondedAt?: string
  sender: {
    _id: string
    username: string
    email: string
  }
  recipient?: {
    _id: string
    username: string
    email: string
  }
  todo: SanityTodo
}

export interface SanityNotification {
  _id: string
  title: string
  description?: string
  dueDate?: string
  createdAt: string
  createdBy: {
    _id: string
    username: string
    email: string
  }
}

export interface SanityNotificationResponse {
  _id: string
  status: "accepted" | "declined"
  respondedAt: string
  notification: SanityNotification
  user: {
    _id: string
    username: string
    email: string
  }
  createdTodo?: {
    _id: string
  }
}

interface CreateUserInput {
  email: string
  username: string
  passwordHash: string
  recoveryCodeHash: string
  role?: "user" | "admin"
}

interface UpdateUserInput {
  email?: string
  username?: string
  passwordHash?: string
}

interface CreateTodoInput {
  title: string
  description?: string
  userId: string
  createdById?: string
  dueDate?: string
  priority?: boolean
  priorityRank?: number
  subtasks?: SanitySubtask[]
}

export type TodoUpdates = {
  title?: string
  description?: string
  completed?: boolean
  priority?: boolean
  priorityRank?: number
  dueDate?: string | null
  subtasks?: SanitySubtask[]
  userId?: string
}

const userProjection = `{
  _id,
  email,
  username,
  passwordHash,
  recoveryCodeHash,
  role,
  createdAt
}`

const todoProjection = `{
  _id,
  title,
  description,
  completed,
  priority,
  priorityRank,
  dueDate,
  completedAt,
  createdAt,
  "subtasks": coalesce(subtasks, []),
  user->{
    _id,
    username,
    email
  },
  createdBy->{
    _id,
    username,
    email
  },
  "isNotificationTask": count(*[_type == "notificationResponse" && createdTodo._ref == ^._id]) > 0
}`

const invitationProjection = `{
  _id,
  email,
  status,
  createdAt,
  respondedAt,
  sender->{
    _id,
    username,
    email
  },
  recipient->{
    _id,
    username,
    email
  },
  todo->${todoProjection}
}`

const notificationProjection = `{
  _id,
  title,
  description,
  dueDate,
  createdAt,
  createdBy->{
    _id,
    username,
    email
  }
}`

const notificationResponseProjection = `{
  _id,
  status,
  respondedAt,
  notification->${notificationProjection},
  user->{
    _id,
    username,
    email
  },
  createdTodo->{
    _id
  }
}`

function normalizeSubtasks(subtasks: SanitySubtask[] = []) {
  return subtasks
    .map((subtask) => ({
      _key: subtask._key ?? `subtask-${crypto.randomUUID()}`,
      title: subtask.title.trim(),
      completed: Boolean(subtask.completed),
    }))
    .filter((subtask) => subtask.title.length > 0)
}

function resolveCompletionState(
  subtasks: SanitySubtask[],
  completedInput?: boolean
) {
  const normalizedSubtasks = normalizeSubtasks(subtasks)
  const allSubtasksCompleted =
    normalizedSubtasks.length > 0 && normalizedSubtasks.every((subtask) => subtask.completed)

  if (completedInput === true) {
    return {
      completed: true,
      completedAt: new Date().toISOString(),
      subtasks: normalizedSubtasks.map((subtask) => ({ ...subtask, completed: true })),
    }
  }

  if (allSubtasksCompleted) {
    return {
      completed: true,
      completedAt: new Date().toISOString(),
      subtasks: normalizedSubtasks,
    }
  }

  if (completedInput === false || normalizedSubtasks.some((subtask) => !subtask.completed)) {
    return {
      completed: false,
      completedAt: null,
      subtasks: normalizedSubtasks,
    }
  }

  return {
    completed: false,
    completedAt: null,
    subtasks: normalizedSubtasks,
  }
}

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
    recoveryCodeHash: input.recoveryCodeHash,
    role: input.role ?? "user",
    createdAt,
  })

  return {
    _id: document._id,
    email: input.email,
    username: input.username,
    passwordHash: input.passwordHash,
    recoveryCodeHash: input.recoveryCodeHash,
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

export async function updateUserPassword(id: string, passwordHash: string): Promise<SanityUser> {
  return updateUser(id, { passwordHash })
}

export async function getTodos(): Promise<SanityTodo[]> {
  return client.fetch(
    `*[_type == "todo"] | order(priority desc, priorityRank asc, dueDate asc, createdAt desc) ${todoProjection}`
  )
}

export async function getTodosByUser(userId: string): Promise<SanityTodo[]> {
  return client.fetch(
    `*[_type == "todo" && (user._ref == $userId || createdBy._ref == $userId)]
      | order(priority desc, priorityRank asc, dueDate asc, createdAt desc) ${todoProjection}`,
    { userId }
  )
}

export async function getTodoByIdForUser(id: string, userId: string): Promise<SanityTodo | null> {
  return client.fetch(
    `*[_type == "todo" && _id == $id && (user._ref == $userId || createdBy._ref == $userId)][0] ${todoProjection}`,
    { id, userId }
  )
}

export async function createTodo(input: CreateTodoInput): Promise<SanityTodo> {
  const createdAt = new Date().toISOString()
  const completion = resolveCompletionState(input.subtasks ?? [], false)

  const document = await client.create({
    _type: "todo",
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    completed: completion.completed,
    priority: input.priority ?? false,
    priorityRank: input.priority ? input.priorityRank ?? 1 : 999,
    dueDate: input.dueDate,
    completedAt: completion.completedAt ?? undefined,
    subtasks: completion.subtasks,
    createdAt,
    user: {
      _type: "reference",
      _ref: input.userId,
    },
    createdBy: {
      _type: "reference",
      _ref: input.createdById ?? input.userId,
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
  const existingTodo = await client.fetch<SanityTodo>(
    `*[_type == "todo" && _id == $id][0] ${todoProjection}`,
    { id }
  )

  if (!existingTodo) {
    throw new Error("Todo not found before update")
  }

  const nextSubtasks = updates.subtasks ?? existingTodo.subtasks ?? []
  const completion = resolveCompletionState(nextSubtasks, updates.completed)

  const setPayload: Record<string, string | boolean | number | SanitySubtask[] | { _type: "reference"; _ref: string }> = {
    completed: completion.completed,
    priority: updates.priority ?? existingTodo.priority,
    priorityRank:
      updates.priority === false
        ? 999
        : updates.priorityRank ?? existingTodo.priorityRank ?? 999,
    subtasks: completion.subtasks,
  }

  if (updates.title !== undefined) {
    setPayload.title = updates.title.trim()
  }

  if (updates.description !== undefined) {
    setPayload.description = updates.description.trim()
  }

  if (updates.dueDate !== undefined && updates.dueDate !== null) {
    setPayload.dueDate = updates.dueDate
  }

  if (completion.completedAt) {
    setPayload.completedAt = completion.completedAt
  }

  if (updates.userId) {
    setPayload.user = {
      _type: "reference",
      _ref: updates.userId,
    }
  }

  let patch = client.patch(id).set(setPayload)

  if (updates.dueDate === null) {
    patch = patch.unset(["dueDate"])
  }

  if (!completion.completedAt) {
    patch = patch.unset(["completedAt"])
  }

  await patch.commit()

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
  const invitationIds = await client.fetch<string[]>(
    `*[_type == "taskInvitation" && todo._ref == $id]._id`,
    { id }
  )

  await Promise.all(invitationIds.map((invitationId) => client.delete(invitationId)))
  await client.delete(id)
}

export async function getAllNotifications(): Promise<SanityNotification[]> {
  return client.fetch(`*[_type == "notification"] | order(createdAt desc) ${notificationProjection}`)
}

export async function deleteNotification(id: string): Promise<void> {
  const responseIds = await client.fetch<string[]>(
    `*[_type == "notificationResponse" && notification._ref == $id]._id`,
    { id }
  )

  await Promise.all(responseIds.map((responseId) => client.delete(responseId)))
  await client.delete(id)
}

export async function deleteUser(id: string): Promise<void> {
  const [todoIds, invitationIds, notificationIds, responseIds] = await Promise.all([
    client.fetch<string[]>(
      `*[_type == "todo" && (user._ref == $id || createdBy._ref == $id)]._id`,
      { id }
    ),
    client.fetch<string[]>(
      `*[_type == "taskInvitation" && (sender._ref == $id || recipient._ref == $id)]._id`,
      { id }
    ),
    client.fetch<string[]>(`*[_type == "notification" && createdBy._ref == $id]._id`, { id }),
    client.fetch<string[]>(
      `*[_type == "notificationResponse" && (user._ref == $id || createdTodo._ref in *[_type == "todo" && (user._ref == $id || createdBy._ref == $id)]._id)]._id`,
      { id }
    ),
  ])

  await Promise.all(responseIds.map((responseId) => client.delete(responseId)))
  await Promise.all(invitationIds.map((invitationId) => client.delete(invitationId)))

  for (const todoId of [...new Set(todoIds)]) {
    await deleteTodo(todoId)
  }

  for (const notificationId of [...new Set(notificationIds)]) {
    await deleteNotification(notificationId)
  }

  await client.delete(id)
}

export async function getTaskInvitationsForUser(
  email: string,
  userId: string
): Promise<SanityTaskInvitation[]> {
  return client.fetch(
    `*[_type == "taskInvitation" && lower(email) == lower($email) && (status == "pending" || recipient._ref == $userId)]
      | order(createdAt desc) ${invitationProjection}`,
    { email, userId }
  )
}

export async function createTaskInvitation(input: {
  todoId: string
  senderId: string
  email: string
}) {
  const normalizedEmail = input.email.trim().toLowerCase()
  const createdAt = new Date().toISOString()
  const recipient = await getUserByEmail(normalizedEmail)

  const existingInvitation = await client.fetch<{ _id: string } | null>(
    `*[_type == "taskInvitation" && todo._ref == $todoId && lower(email) == $email][0]{ _id }`,
    { todoId: input.todoId, email: normalizedEmail }
  )

  if (existingInvitation?._id) {
    const patch = client
      .patch(existingInvitation._id)
      .set({
        email: normalizedEmail,
        status: "pending",
        sender: {
          _type: "reference",
          _ref: input.senderId,
        },
        recipient: recipient
          ? {
              _type: "reference",
              _ref: recipient._id,
            }
          : undefined,
        createdAt,
      })
      .unset(["respondedAt"])

    await patch.commit()
  } else {
    await client.create({
      _type: "taskInvitation",
      email: normalizedEmail,
      status: "pending",
      createdAt,
      todo: {
        _type: "reference",
        _ref: input.todoId,
      },
      sender: {
        _type: "reference",
        _ref: input.senderId,
      },
      ...(recipient
        ? {
            recipient: {
              _type: "reference",
              _ref: recipient._id,
            },
          }
        : {}),
    })
  }

  const invitation = await client.fetch<SanityTaskInvitation>(
    `*[_type == "taskInvitation" && todo._ref == $todoId && lower(email) == $email][0] ${invitationProjection}`,
    { todoId: input.todoId, email: normalizedEmail }
  )

  if (!invitation) {
    throw new Error("Invitation not found after creation")
  }

  return invitation
}

export async function respondToTaskInvitation(input: {
  invitationId: string
  userId: string
  status: "accepted" | "declined"
}) {
  const invitation = await client.fetch<SanityTaskInvitation>(
    `*[_type == "taskInvitation" && _id == $invitationId][0] ${invitationProjection}`,
    { invitationId: input.invitationId }
  )

  if (!invitation) {
    throw new Error("Invitation not found")
  }

  const respondedAt = new Date().toISOString()

  await client
    .patch(input.invitationId)
    .set({
      status: input.status,
      respondedAt,
      recipient: {
        _type: "reference",
        _ref: input.userId,
      },
    })
    .commit()

  if (input.status === "accepted") {
    await createTodo({
      title: invitation.todo.title,
      description: invitation.todo.description,
      dueDate: invitation.todo.dueDate,
      priority: invitation.todo.priority,
      priorityRank: invitation.todo.priorityRank,
      subtasks: invitation.todo.subtasks,
      userId: input.userId,
      createdById: input.userId,
    })
  }

  const updatedInvitation = await client.fetch<SanityTaskInvitation>(
    `*[_type == "taskInvitation" && _id == $invitationId][0] ${invitationProjection}`,
    { invitationId: input.invitationId }
  )

  if (!updatedInvitation) {
    throw new Error("Invitation not found after response")
  }

  return updatedInvitation
}

export async function reorderPriorityTodos(userId: string, orderedTodoIds: string[]) {
  const accessibleIds = await client.fetch<string[]>(
    `*[_type == "todo" && _id in $orderedTodoIds && (user._ref == $userId || createdBy._ref == $userId)]._id`,
    { orderedTodoIds, userId }
  )

  if (accessibleIds.length !== orderedTodoIds.length) {
    throw new Error("Some tasks are not accessible for reordering")
  }

  await Promise.all(
    orderedTodoIds.map((todoId, index) =>
      client
        .patch(todoId)
        .set({
          priority: true,
          priorityRank: index + 1,
        })
        .commit()
    )
  )
}

export async function createNotification(input: {
  title: string
  description?: string
  dueDate?: string
  createdById: string
}) {
  const createdAt = new Date().toISOString()

  const document = await client.create({
    _type: "notification",
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    dueDate: input.dueDate,
    createdAt,
    createdBy: {
      _type: "reference",
      _ref: input.createdById,
    },
  })

  const notification = await client.fetch<SanityNotification>(
    `*[_type == "notification" && _id == $id][0] ${notificationProjection}`,
    { id: document._id }
  )

  if (!notification) {
    throw new Error("Notification not found after creation")
  }

  return notification
}

export async function getNotificationsForUser(userId: string): Promise<SanityNotification[]> {
  const now = new Date().toISOString()
  return client.fetch(
    `*[_type == "notification"
      && !(_id in *[_type == "notificationResponse" && user._ref == $userId].notification._ref)
      && (!defined(dueDate) || dueDate >= $now)]
      | order(createdAt desc) ${notificationProjection}`,
    { userId, now }
  )
}

export async function respondToNotification(input: {
  notificationId: string
  userId: string
  status: "accepted" | "declined"
}) {
  const notification = await client.fetch<SanityNotification>(
    `*[_type == "notification" && _id == $notificationId][0] ${notificationProjection}`,
    { notificationId: input.notificationId }
  )

  if (!notification) {
    throw new Error("Notification not found")
  }

  if (notification.dueDate && new Date(notification.dueDate).getTime() < Date.now()) {
    throw new Error("Notification expired")
  }

  let createdTodoId: string | undefined

  if (input.status === "accepted") {
    const todo = await createTodo({
      title: notification.title,
      description: notification.description,
      dueDate: notification.dueDate,
      userId: input.userId,
      createdById: notification.createdBy._id,
    })
    createdTodoId = todo._id
  }

  await client.create({
    _type: "notificationResponse",
    status: input.status,
    respondedAt: new Date().toISOString(),
    notification: {
      _type: "reference",
      _ref: input.notificationId,
    },
    user: {
      _type: "reference",
      _ref: input.userId,
    },
    ...(createdTodoId
      ? {
          createdTodo: {
            _type: "reference",
            _ref: createdTodoId,
          },
        }
      : {}),
  })

  const responses = await client.fetch<SanityNotificationResponse[]>(
    `*[_type == "notificationResponse" && user._ref == $userId && notification._ref == $notificationId]
      | order(respondedAt desc) ${notificationResponseProjection}`,
    { userId: input.userId, notificationId: input.notificationId }
  )

  return responses[0] ?? null
}
