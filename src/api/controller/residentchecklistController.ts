import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status = 500) =>
  NextResponse.json({ success: false, message }, { status });

const sendSuccess = (data: any, message = 'Success', status = 200) =>
  NextResponse.json({ success: true, message, data }, { status });

export const getAllResidentChecklists = async () => {
  try {
    const result = await query(`SELECT * FROM resident_checklists ORDER BY id DESC`);
    return sendSuccess(result.rows, 'Resident checklists fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch resident checklists');
  }
};

export const getOneResidentChecklist = async (id: string) => {
  try {
    const result = await query(`SELECT * FROM resident_checklists WHERE id = $1`, [id]);
    if (result.rowCount === 0) return sendError('Checklist not found', 404);
    return sendSuccess(result.rows[0], 'Checklist fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch checklist');
  }
};

export const createResidentChecklist = async (req: NextRequest) => {
  try {
    const { resident, program_activity, score_point, checklist_date, checklist_time, description } = await req.json();
    const result = await query(
      `INSERT INTO resident_checklists (resident, program_activity, score_point, checklist_date, checklist_time, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [resident, program_activity, score_point, checklist_date, checklist_time, description]
    );
    return sendSuccess(result.rows[0], 'Checklist created', 201);
  } catch (error) {
    console.error(error);
    return sendError('Failed to create checklist');
  }
};

export const updateResidentChecklist = async (req: NextRequest, id: string) => {
  try {
    const { resident, program_activity, score_point, checklist_date, checklist_time, description } = await req.json();
    const result = await query(
      `UPDATE resident_checklists SET resident = $1, program_activity = $2, score_point = $3,
       checklist_date = $4, checklist_time = $5, description = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
      [resident, program_activity, score_point, checklist_date, checklist_time, description, id]
    );
    if (result.rowCount === 0) return sendError('Checklist not found', 404);
    return sendSuccess(result.rows[0], 'Checklist updated');
  } catch (error) {
    console.error(error);
    return sendError('Failed to update checklist');
  }
};

export const deleteResidentChecklist = async (id: string) => {
  try {
    const result = await query(`DELETE FROM resident_checklists WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return sendError('Checklist not found', 404);
    return sendSuccess({ id }, 'Checklist deleted');
  } catch (error) {
    console.error(error);
    return sendError('Failed to delete checklist');
  }
};
