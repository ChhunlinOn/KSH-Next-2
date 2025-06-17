import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status: number = 500) =>
  NextResponse.json({ status, success: false, message }, { status });

const sendSuccess = (data: any, message: string, status: number = 200) =>
  NextResponse.json({ status, success: true, message, data }, { status });

// GET all program levels
export const getAllProgramLevels = async () => {
  try {
    const result = await query(`SELECT * FROM program_levels ORDER BY program_level_order ASC`);
    return sendSuccess(result.rows, 'Program levels fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch program levels');
  }
};

// GET one by ID
export const getOneProgramLevel = async (id: string) => {
  try {
    const result = await query(`SELECT * FROM program_levels WHERE id = $1`, [id]);
    if (result.rowCount === 0) return sendError('Program level not found', 404);
    return sendSuccess(result.rows[0], 'Program level fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch program level');
  }
};

// POST: Create new program level
export const createProgramLevel = async (req: NextRequest) => {
  try {
    const { program_level_name, program_level_order, description } = await req.json();
    const result = await query(
      `INSERT INTO program_levels (program_level_name, program_level_order, description) VALUES ($1, $2, $3) RETURNING *`,
      [program_level_name, program_level_order, description]
    );
    return sendSuccess(result.rows[0], 'Program level created', 201);
  } catch (error) {
    console.error(error);
    return sendError('Failed to create program level');
  }
};

// PUT: Update existing
export const updateProgramLevel = async (req: NextRequest, id: string) => {
  try {
    const { program_level_name, program_level_order, description } = await req.json();
    const result = await query(
      `UPDATE program_levels SET program_level_name = $1, program_level_order = $2, description = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [program_level_name, program_level_order, description, id]
    );
    if (result.rowCount === 0) return sendError('Program level not found', 404);
    return sendSuccess(result.rows[0], 'Program level updated');
  } catch (error) {
    console.error(error);
    return sendError('Failed to update program level');
  }
};

// DELETE
export const deleteProgramLevel = async (id: string) => {
  try {
    const result = await query(`DELETE FROM program_levels WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return sendError('Program level not found', 404);
    return sendSuccess({ id }, 'Program level deleted');
  } catch (error) {
    console.error(error);
    return sendError('Failed to delete program level');
  }
};
