import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status: number = 500) => {
  return NextResponse.json({ status, success: false, message }, { status });
};

const sendSuccess = (data: any, message: string, status: number = 200) => {
  return NextResponse.json({ status, success: true, message, data }, { status });
};

// GET all assessments
export const getAssessments = async () => {
  try {
    const result = await query('SELECT * FROM assessments ORDER BY id DESC');
    return sendSuccess(result.rows, 'Assessments fetched successfully');
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return sendError('Failed to fetch assessments');
  }
};

// GET one assessment
export const getOneAssessment = async (id: string) => {
  try {
    const result = await query('SELECT * FROM assessments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return sendError('Assessment not found', 404);
    }
    return sendSuccess(result.rows[0], 'Assessment fetched successfully');
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return sendError('Failed to fetch assessment');
  }
};

// POST: Create a new assessment
export const createAssessment = async (req: NextRequest) => {
  try {
    const { title, google_form_url } = await req.json();

    if (!title || !google_form_url) {
      return sendError('Title and Google Form URL are required', 400);
    }

    const result = await query(
      `INSERT INTO assessments (title, google_form_url)
       VALUES ($1, $2) RETURNING *`,
      [title, google_form_url]
    );

    return sendSuccess(result.rows[0], 'Assessment created successfully', 201);
  } catch (error) {
    console.error('Error creating assessment:', error);
    return sendError('Failed to create assessment');
  }
};

// PUT: Update assessment
export const updateAssessment = async (req: NextRequest, id: string) => {
  try {
    const data = await req.json();

    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      return sendError('No fields provided to update', 400);
    }

    values.push(id);

    const result = await query(
      `UPDATE assessments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return sendError('Assessment not found', 404);
    }

    return sendSuccess(result.rows[0], 'Assessment updated successfully');
  } catch (error) {
    console.error('Error updating assessment:', error);
    return sendError('Failed to update assessment');
  }
};

// DELETE: Delete assessment
export const deleteAssessment = async (id: string) => {
  try {
    const result = await query('DELETE FROM assessments WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return sendError('Assessment not found', 404);
    }

    return sendSuccess({ id }, 'Assessment deleted successfully');
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return sendError('Failed to delete assessment');
  }
};
