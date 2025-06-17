// File: controller/programTypeController.ts
import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status = 500) =>
  NextResponse.json({ success: false, message }, { status });

const sendSuccess = (data: any, message = 'Success', status = 200) =>
  NextResponse.json({ success: true, message, data }, { status });

// GET all program types
export const getAllProgramTypes = async () => {
  try {
    const result = await query(`SELECT * FROM program_types ORDER BY id DESC`);
    return sendSuccess(result.rows, 'Program types fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch program types');
  }
};

// GET one program type by ID
export const getOneProgramType = async (id: string) => {
  try {
    const result = await query(`SELECT * FROM program_types WHERE id = $1`, [id]);
    if (result.rowCount === 0) return sendError('Program type not found', 404);
    return sendSuccess(result.rows[0], 'Program type fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch program type');
  }
};

// POST: Create new program type
export const createProgramType = async (req: NextRequest) => {
  try {
    const { program_type_name, description, img_url } = await req.json();
    const result = await query(
      `INSERT INTO program_types (program_type_name, description, img_url) VALUES ($1, $2, $3) RETURNING *`,
      [program_type_name, description, img_url]
    );
    return sendSuccess(result.rows[0], 'Program type created', 201);
  } catch (error) {
    console.error(error);
    return sendError('Failed to create program type');
  }
};

// PUT: Update program type
export const updateProgramType = async (req: NextRequest, id: string) => {
  try {
    const { program_type_name, description, img_url } = await req.json();
    const result = await query(
      `UPDATE program_types SET program_type_name = $1, description = $2, img_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [program_type_name, description, img_url, id]
    );
    if (result.rowCount === 0) return sendError('Program type not found', 404);
    return sendSuccess(result.rows[0], 'Program type updated');
  } catch (error) {
    console.error(error);
    return sendError('Failed to update program type');
  }
};

// DELETE program type
export const deleteProgramType = async (id: string) => {
  try {
    const result = await query(`DELETE FROM program_types WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return sendError('Program type not found', 404);
    return sendSuccess({ id }, 'Program type deleted');
  } catch (error) {
    console.error(error);
    return sendError('Failed to delete program type');
  }
};
