import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status: number = 500) =>
  NextResponse.json({ status, success: false, message }, { status });

const sendSuccess = (data: any, message: string, status: number = 200) =>
  NextResponse.json({ status, success: true, message, data }, { status });

// GET all
export const getAllMedicalComments = async () => {
  try {
    const result = await query(`SELECT * FROM medical_comments ORDER BY id DESC`);
    return sendSuccess(result.rows, 'Medical comments fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch medical comments');
  }
};

// GET By ID
export const getOneMedicalComment = async (id: string) => {
  try {
    const result = await query(`SELECT * FROM medical_comments WHERE id = $1`, [id]);
    if (result.rows.length === 0) return sendError('Medical comment not found', 404);
    return sendSuccess(result.rows[0], 'Medical comment fetched');
  } catch (error) {
    console.error(error);
    return sendError('Failed to fetch medical comment');
  }
};


// CREATE
export const createMedicalComment = async (req: NextRequest) => {
  try {
    const { resident_medical_id, comment } = await req.json();
    const result = await query(
      `INSERT INTO medical_comments (resident_medical_id, comment) VALUES ($1, $2) RETURNING *`,
      [resident_medical_id, comment]
    );
    return sendSuccess(result.rows[0], 'Medical comment created', 201);
  } catch (error) {
    console.error(error);
    return sendError('Failed to create medical comment');
  }
};


// UPDATE
export const updateMedicalComment = async (req: NextRequest, id: string) => {
  try {
    const { comment } = await req.json();
    const result = await query(
      `UPDATE medical_comments SET comment = $1, created_at = NOW() WHERE id = $2 RETURNING *`,
      [comment, id]
    );
    if (result.rowCount === 0) return sendError('Medical comment not found', 404);
    return sendSuccess(result.rows[0], 'Medical comment updated');
  } catch (error) {
    console.error(error);
    return sendError('Failed to update medical comment');
  }
};


// DELETE
export const deleteMedicalComment = async (id: string) => {
  try {
    const result = await query(`DELETE FROM medical_comments WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) return sendError('Medical comment not found', 404);
    return sendSuccess({ id }, 'Medical comment deleted');
  } catch (error) {
    console.error(error);
    return sendError('Failed to delete medical comment');
  }
};