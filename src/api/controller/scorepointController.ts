import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendSuccess = (data: any, message: string, status: number = 200) =>
  NextResponse.json({ status, success: true, message, data }, { status });

const sendError = (message: string, status: number = 500) =>
  NextResponse.json({ status, success: false, message }, { status });


// GET all score points
export const getScorePoints = async () => {
  try {
    const result = await query('SELECT * FROM score_points ORDER BY id DESC');
    return sendSuccess(result.rows, 'Score points fetched successfully', 200);
  } catch (error) {
    console.error('Fetch error:', error);
    return sendError('Failed to fetch score points', 500);
  }
};

// GET one score point
export const getOneScorePoint = async (id: string) => {
  try {
    const result = await query('SELECT * FROM score_points WHERE id = $1', [id]);
    if (result.rows.length === 0) return sendError('Score point not found', 404);
    return sendSuccess(result.rows[0], 'Score point fetched', 200);
  } catch (error) {
    console.error('Fetch one error:', error);
    return sendError('Failed to fetch score point', 500);
  }
};

// POST: Create score point
export const createScorePoint = async (req: NextRequest) => {
  try {
    const { score_name, score_point = 0, description, image } = await req.json();

    const result = await query(
      `INSERT INTO score_points (score_name, score_point, description, image)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [score_name, score_point, description, image]
    );

    return sendSuccess(result.rows[0], 'Score point created successfully', 201);
  } catch (error) {
    console.error('Create error:', error);
    return sendError('Failed to create score point', 500);
  }
};

// PUT: Update score point
export const updateScorePoint = async (req: NextRequest, id: string) => {
  try {
    const data = await req.json();
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (!fields.length) return sendError('No data provided for update', 400);
    values.push(id);

    const result = await query(
      `UPDATE score_points SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return sendError('Score point not found', 404);
    return sendSuccess(result.rows[0], 'Score point updated successfully', 200);
  } catch (error) {
    console.error('Update error:', error);
    return sendError('Failed to update score point', 500);
  }
};

// DELETE score point
export const deleteScorePoint = async (id: string) => {
  try {
    const result = await query('DELETE FROM score_points WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return sendError('Score point not found', 404);
    return sendSuccess({ id }, 'Score point deleted successfully', 200);
  } catch (error) {
    console.error('Delete error:', error);
    return sendError('Failed to delete score point', 500);
  }
};
