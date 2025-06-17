import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status = 500) =>
  NextResponse.json({ success: false, message }, { status });

const sendSuccess = (data: any, message = 'Success', status = 200) =>
  NextResponse.json({ success: true, message, data }, { status });

export const getAllProgramActivities = async () => {
  try {
    const result = await query(`
      SELECT 
        pa.*, 
        json_build_object(
          'id', pt.id,
          'program_type_name', pt.program_type_name,
          'description', pt.description,
          'img_url', pt.img_url
        ) AS program_type
      FROM program_activities pa
      LEFT JOIN program_types pt ON pa.program_type = pt.id
      ORDER BY pa.id DESC
    `);
    return sendSuccess(result.rows, 'Program activities fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch program activities');
  }
};

export const getOneProgramActivity = async (id: string) => {
  try {
    const result = await query(`
      SELECT 
        pa.*, 
        json_build_object(
          'id', pt.id,
          'program_type_name', pt.program_type_name,
          'description', pt.description,
          'img_url', pt.img_url
        ) AS program_type
      FROM program_activities pa
      LEFT JOIN program_types pt ON pa.program_type = pt.id
      WHERE pa.id = $1
    `, [id]);

    if (result.rowCount === 0) return sendError('Program activity not found', 404);
    return sendSuccess(result.rows[0], 'Program activity fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch program activity');
  }
};


export const createProgramActivity = async (req: NextRequest) => {
  try {
    const { program_activity_name, gender, img_url, description, program_type } = await req.json();
    const result = await query(
      `INSERT INTO program_activities (program_activity_name, gender, img_url, description, program_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [program_activity_name, gender, img_url, description, program_type]
    );
    return sendSuccess(result.rows[0], 'Program activity created', 201);
  } catch (error) {
    console.error(error);
    return sendError('Failed to create program activity');
  }
};

export const updateProgramActivity = async (req: NextRequest, id: string) => {
  try {
    const { program_activity_name, gender, img_url, description, program_type } = await req.json();
    const result = await query(
      `UPDATE program_activities
       SET program_activity_name = $1, gender = $2, img_url = $3, description = $4, program_type = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [program_activity_name, gender, img_url, description, program_type, id]
    );
    if (result.rowCount === 0) return sendError('Program activity not found', 404);
    return sendSuccess(result.rows[0], 'Program activity updated');
  } catch (error) {
    console.error(error);
    return sendError('Failed to update program activity');
  }
};

export const deleteProgramActivity = async (id: string) => {
  try {
    const result = await query(`DELETE FROM program_activities WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return sendError('Program activity not found', 404);
    return sendSuccess({ id }, 'Program activity deleted');
  } catch (error) {
    console.error(error);
    return sendError('Failed to delete program activity');
  }
};
