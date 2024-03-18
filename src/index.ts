import { Server } from 'azle';
import { Actor, BgentRuntime, DatabaseAdapter, Goal, GoalStatus, Memory, Relationship } from 'bgent';
import express from 'express';
import initSqlJs from 'sql.js/dist/sql-asm.js';
type UUID = `${string}-${string}-${string}-${string}-${string}`;


const sqliteTables = `
sqlite_dump = """
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Table: accounts
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "avatar_url" TEXT,
    "details" TEXT DEFAULT '{}'
);

-- Table: credits
CREATE TABLE IF NOT EXISTS "credits" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "sender_id" TEXT,
    "receiver_id" TEXT,
    "amount" NUMERIC,
    "reason" TEXT
);

-- Table: descriptions
CREATE TABLE IF NOT EXISTS "descriptions" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "embedding" BLOB NOT NULL,
    "user_id" TEXT,
    "user_ids" TEXT,
    "room_id" TEXT,
    "name" TEXT,
    "unique" INTEGER DEFAULT 1 NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id"),
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
);

-- Table: facts
CREATE TABLE IF NOT EXISTS "facts" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "embedding" BLOB NOT NULL,
    "user_id" TEXT,
    "user_ids" TEXT,
    "room_id" TEXT,
    "unique" INTEGER DEFAULT 1 NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id"),
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
);

-- Table: goals
CREATE TABLE IF NOT EXISTS "goals" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "user_ids" TEXT DEFAULT '[]' NOT NULL,
    "user_id" TEXT,
    "name" TEXT,
    "status" TEXT,
    "description" TEXT,
    "objectives" TEXT DEFAULT '[]' NOT NULL
);

-- Table: logs
CREATE TABLE IF NOT EXISTS "logs" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_ids" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL
);

-- Table: lore
CREATE TABLE IF NOT EXISTS "lore" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "embedding" BLOB NOT NULL,
    "user_id" TEXT,
    "user_ids" TEXT,
    "room_id" TEXT,
    "name" TEXT,
    "unique" INTEGER DEFAULT 1 NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id"),
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
);

-- Table: messages
CREATE TABLE IF NOT EXISTS "messages" (
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "content" TEXT,
    "is_edited" INTEGER DEFAULT 0,
    "room_id" TEXT,
    "updated_at" TIMESTAMP,
    "user_ids" TEXT DEFAULT '[]' NOT NULL,
    "id" TEXT PRIMARY KEY,
    "embedding" BLOB,
    "unique" INTEGER DEFAULT 1 NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id"),
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
);

-- Table: participants
CREATE TABLE IF NOT EXISTS "participants" (
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "room_id" TEXT,
    "id" TEXT PRIMARY KEY,
    "last_message_read" TEXT,
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id"),
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
);

-- Table: relationships
CREATE TABLE IF NOT EXISTS "relationships" (
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "user_a" TEXT,
    "user_b" TEXT,
    "status" TEXT,
    "id" TEXT PRIMARY KEY,
    "room_id" TEXT,
    "user_id" TEXT NOT NULL,
    FOREIGN KEY ("user_a") REFERENCES "accounts"("id"),
    FOREIGN KEY ("user_b") REFERENCES "accounts"("id"),
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id")
);

-- Table: rooms
CREATE TABLE IF NOT EXISTS "rooms" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "name" TEXT,
    FOREIGN KEY ("created_by") REFERENCES "accounts"("id")
);

-- Index: relationships_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "relationships_id_key" ON "relationships" ("id");

-- Index: messages_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "messages_id_key" ON "messages" ("id");

-- Index: participants_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "participants_id_key" ON "participants" ("id");

COMMIT;
"""`

export class SqliteDatabaseAdapter extends DatabaseAdapter {
  private db: any;

  constructor(db: any) {
    super();
    this.db = db;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getAccountById(userId: UUID): Promise<any | null> {
    const sql = "SELECT * FROM accounts WHERE id = ?";
    const rows = await this.query(sql, [userId]);
    return rows[0] as any || null;
  }

  async createAccount(account: any): Promise<void> {
    const sql = "INSERT INTO accounts (id, name, email, avatar_url, details) VALUES (?, ?, ?, ?, ?)";
    await this.query(sql, [account.id, account.name, account.email, account.avatar_url, JSON.stringify(account.details)]);
  }

  async getActorDetails(params: { userIds: UUID[] }): Promise<Actor[]> {
    const sql = "SELECT * FROM accounts WHERE id IN (?)";
    const rows = await this.query(sql, [params.userIds]);
    return rows.map((actor: Actor) => ({
      name: actor.name,
      details: actor.details,
      id: actor.id,
    }));
  }

  async searchMemories(params: {
    tableName: string;
    userIds: UUID[];
    embedding: number[];
    match_threshold: number;
    match_count: number;
    unique: boolean;
  }): Promise<Memory[]> {
    throw new Error("Method not implemented.");
  }

  async getMemoryByContent(opts: {
    query_table_name: string;
    query_threshold: number;
    query_input: string;
    query_field_name: string;
    query_field_sub_name: string;
    query_match_count: number;
  }): Promise<[]> {
    throw new Error("Method not implemented.");
  }

  async updateGoalStatus(params: {
    goalId: UUID;
    status: GoalStatus;
  }): Promise<void> {
    const sql = "UPDATE goals SET status = ? WHERE id = ?";
    await this.query(sql, [params.status, params.goalId]);
  }

  async log(params: {
    body: { [key: string]: unknown };
    user_id: UUID;
    room_id: UUID;
    user_ids: UUID[];
    agent_id: UUID;
    type: string;
  }): Promise<void> {
    const sql = "INSERT INTO logs (body, user_id, room_id, user_ids, agent_id, type) VALUES (?, ?, ?, ?, ?, ?)";
    await this.query(sql, [JSON.stringify(params.body), params.user_id, params.room_id, params.user_ids, params.agent_id, params.type]);
  }

  async getMemoriesByIds(params: {
    userIds: UUID[];
    count?: number;
    unique?: boolean;
    tableName: string;
  }): Promise<Memory[]> {
    let sql = `SELECT * FROM ${params.tableName} WHERE user_ids @> ?`;
    const queryParams = [JSON.stringify(params.userIds)];

    if (params.unique) {
      sql += " AND unique = 1";
    }

    if (params.count) {
      sql += " LIMIT ?";
      queryParams.push(params.count.toString());
    }

    const rows = await this.query(sql, queryParams);
    return rows as Memory[];
  }

  async searchMemoriesByEmbedding(
    embedding: number[],
    params: {
      match_threshold?: number;
      count?: number;
      userIds?: UUID[];
      unique?: boolean;
      tableName: string;
    },
  ): Promise<Memory[]> {
    throw new Error("Method not implemented.");
  }

  async createMemory(
    memory: Memory,
    tableName: string,
    unique = false,
  ): Promise<void> {
    const sql = `INSERT INTO ${tableName} (id, created_at, content, embedding, user_id, user_ids, room_id, unique) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await this.query(sql, [memory.id, memory.created_at, JSON.stringify(memory.content), JSON.stringify(memory.embedding), memory.user_id, JSON.stringify(memory.user_ids), memory.room_id, unique ? 1 : 0]);
  }

  async removeMemory(memoryId: UUID, tableName: string): Promise<void> {
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;
    await this.query(sql, [memoryId]);
  }

  async removeAllMemoriesByUserIds(
    userIds: UUID[],
    tableName: string,
  ): Promise<void> {
    const sql = `DELETE FROM ${tableName} WHERE user_ids @> ?`;
    await this.query(sql, [JSON.stringify(userIds)]);
  }

  async countMemoriesByUserIds(
    userIds: UUID[],
    unique = true,
    tableName = "",
  ): Promise<number> {
    if (!tableName) {
      throw new Error("tableName is required");
    }

    let sql = `SELECT COUNT(*) as count FROM ${tableName} WHERE user_ids @> ?`;
    const queryParams = [JSON.stringify(userIds)];

    if (unique) {
      sql += " AND unique = 1";
    }

    const rows = await this.query(sql, queryParams);
    return rows[0].count;
  }

  async getGoals(params: {
    userIds: UUID[];
    userId?: UUID | null;
    onlyInProgress?: boolean;
    count?: number;
  }): Promise<Goal[]> {
    let sql = "SELECT * FROM goals WHERE user_ids @> ?";
    const queryParams = [JSON.stringify(params.userIds)];

    if (params.userId) {
      sql += " AND user_id = ?";
      queryParams.push(params.userId);
    }

    if (params.onlyInProgress) {
      sql += " AND status = 'IN_PROGRESS'";
    }

    if (params.count) {
      sql += " LIMIT ?";
      queryParams.push(params.count.toString());
    }

    const rows = await this.query(sql, queryParams);
    return rows as Goal[];
  }

  async updateGoal(goal: Goal): Promise<void> {
    const sql = "UPDATE goals SET name = ?, status = ?, objectives = ? WHERE id = ?";
    await this.query(sql, [goal.name, goal.status, JSON.stringify(goal.objectives), goal.id]);
  }

  async createGoal(goal: Goal): Promise<void> {
    const sql = "INSERT INTO goals (id, user_ids, user_id, name, status, objectives) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await this.query(sql, [goal.id, JSON.stringify(goal.user_ids), goal.user_id, goal.name, goal.status, JSON.stringify(goal.objectives)]);
  }

  async createRelationship(params: {
    userA: UUID;
    userB: UUID;
  }): Promise<boolean> {
    const sql = "INSERT INTO relationships (user_a, user_b, user_id) VALUES (?, ?, ?)";
    await this.query(sql, [params.userA, params.userB, params.userA]);
    return true;
  }

  async getRelationship(params: {
    userA: UUID;
    userB: UUID;
  }): Promise<Relationship | null> {
    const sql = "SELECT * FROM relationships WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)";
    const rows = await this.query(sql, [params.userA, params.userB, params.userB, params.userA]);
    return rows[0] as Relationship || null;
  }

  async getRelationships(params: { userId: UUID }): Promise<Relationship[]> {
    const sql = "SELECT * FROM relationships WHERE (user_a = ? OR user_b = ?) AND status = 'FRIENDS'";
    const rows = await this.query(sql, [params.userId, params.userId]);
    return rows as Relationship[];
  }
}

export default Server(async () => {
    const app = express();

    app.get('/', async (req, res) => {
        try {

            const SQL = await initSqlJs({});
            
            const db = new SQL.Database();
            
            const adapter = new SqliteDatabaseAdapter(db);
            const runtime = new BgentRuntime({
                databaseAdapter: adapter,
                token: process.env.OPENAI_API_KEY as string,
            })
            
            // init tables
            // db.run(sqliteTables);
            
            res.send('Hello world');
        } catch (error) {
            console.error(error);
        }
    });

    return app.listen();
});