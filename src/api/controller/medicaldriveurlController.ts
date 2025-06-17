import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status: number = 500) =>
  NextResponse.json({ status, success: false, message }, { status });

const sendSuccess = (data: any, message: string, status: number = 200) =>
  NextResponse.json({ status, success: true, message, data }, { status });

//  GET all
export const getAllMedicalDrives = async () => {
  try {
    const result = await query(`SELECT * FROM medical_url_drives ORDER BY id DESC`);
    return sendSuccess(result.rows, 'Drive URLs fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch drive URLs');
  }
};

//  GET one by ID
export const getOneMedicalDrive = async (id: string) => {
  try {
    const result = await query(`SELECT * FROM medical_url_drives WHERE id = $1`, [id]);
    if (result.rows.length === 0) return sendError('Drive URL not found', 404);
    return sendSuccess(result.rows[0], 'Drive URL fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch drive URL');
  }
};

//  POST 
export const createMedicalDrive = async (req: NextRequest) => {
  try {
    const { resident_medical_id, drive_url, description } = await req.json();
    const result = await query(
      `INSERT INTO medical_url_drives (resident_medical_id, drive_url, description) VALUES ($1, $2, $3) RETURNING *`,
      [resident_medical_id, drive_url, description]
    );
    return sendSuccess(result.rows[0], 'Drive URL created', 201);
  } catch (error) {
    console.error(error);
    return sendError('Failed to create drive URL');
  }
};

// UPDATE 
export const updateMedicalDrive = async (req: NextRequest, id: string) => {
  try {
    const { drive_url, description } = await req.json();
    const result = await query(
`UPDATE medical_url_drives SET drive_url = $1, description = $2 WHERE id = $3 RETURNING *`,
      [drive_url, description, id]
    );
    if (result.rowCount === 0) return sendError('Drive URL not found', 404);
    return sendSuccess(result.rows[0], 'Drive URL updated');
  } catch (error) {
    console.error(error);
    return sendError('Failed to update drive URL');
  }
};


//DELETE 
export const deleteMedicalDrive = async (id: string) => {
  try {
    const result = await query(`DELETE FROM medical_url_drives WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return sendError('Drive URL not found', 404);
    return sendSuccess({ id }, 'Drive URL deleted');
  } catch (error) {
    console.error(error);
    return sendError('Failed to delete drive URL');
  }
};
