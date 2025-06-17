import { query } from "../config/postgres";
import { NextRequest, NextResponse } from "next/server";

const sendError = (message: string, status: number = 500) =>
  NextResponse.json({ status, success: false, message }, { status });

const sendSuccess = (data: any, message: string, status: number = 200) =>
  NextResponse.json({ status, success: true, message, data }, { status });

// Get all resident medical records with resident info, comments, drive URLs
export const getResidentMedicals = async () => {
  try {
    const result = await query(`
      SELECT rm.*, r.*, 
        COALESCE(json_agg(DISTINCT mc.*) FILTER (WHERE mc.id IS NOT NULL), '[]') AS comments,
        COALESCE(json_agg(DISTINCT md.*) FILTER (WHERE md.id IS NOT NULL), '[]') AS drive_urls
      FROM resident_medicals rm
      JOIN residents r ON r.id = rm.resident_id
      LEFT JOIN medical_comments mc ON mc.resident_medical_id = rm.id
      LEFT JOIN medical_url_drives md ON md.resident_medical_id = rm.id
      GROUP BY rm.id, r.id
      ORDER BY rm.id DESC
    `);
    return sendSuccess(result.rows, "Resident medical records fetched");
  } catch (error) {
    console.error(error);
    return sendError("Failed to fetch resident medical records");
  }
};

// Get one record by ID
export const getOneResidentMedical = async (id: string) => {
  try {
    const result = await query(
      `
      SELECT rm.*, r.*, 
        COALESCE(json_agg(DISTINCT mc.*) FILTER (WHERE mc.id IS NOT NULL), '[]') AS comments,
        COALESCE(json_agg(DISTINCT md.*) FILTER (WHERE md.id IS NOT NULL), '[]') AS drive_urls
      FROM resident_medicals rm
      JOIN residents r ON r.id = rm.resident_id
      LEFT JOIN medical_comments mc ON mc.resident_medical_id = rm.id
      LEFT JOIN medical_url_drives md ON md.resident_medical_id = rm.id
      WHERE rm.id = $1
      GROUP BY rm.id, r.id
    `,
      [id]
    );

    if (result.rows.length === 0) return sendError("Record not found", 404);
    return sendSuccess(result.rows[0], "Resident medical record fetched");
  } catch (error) {
    console.error(error);
    return sendError("Failed to fetch record");
  }
};

// Create new resident medical record
export const createResidentMedical = async (req: NextRequest) => {
  try {
    const {
      resident_id,
      medical_treatment,
      doctor,
      treatment_date,
      specialist_doctor_comment,
      next_appointment,
      next_appointment_remark,
      require_to_use,
    } = await req.json();

    const result = await query(
      `
      INSERT INTO resident_medicals (
        resident_id, medical_treatment, doctor, treatment_date,
        specialist_doctor_comment, next_appointment, next_appointment_remark, require_to_use
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        resident_id,
        medical_treatment,
        doctor,
        treatment_date,
        specialist_doctor_comment,
        next_appointment,
        next_appointment_remark,
        require_to_use,
      ]
    );

    return sendSuccess(result.rows[0], "Resident medical record created", 201);
  } catch (error) {
    console.error(error);
    return sendError("Failed to create record");
  }
};

// Update existing resident medical record
export const updateResidentMedical = async (req: NextRequest, id: string) => {
  try {
    const data = await req.json();
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (!fields.length) return sendError("No fields to update", 400);

    values.push(id);
    const result = await query(
      `UPDATE resident_medicals SET ${fields.join(
        ", "
      )}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return sendError("Record not found", 404);
    return sendSuccess(result.rows[0], "Resident medical record updated");
  } catch (error) {
    console.error(error);
    return sendError("Failed to update record");
  }
};

// Delete a resident medical record and its relations
export const deleteResidentMedical = async (id: string) => {
  try {
    await query("DELETE FROM medical_comments WHERE resident_medical_id = $1", [
      id,
    ]);
    await query(
      "DELETE FROM medical_url_drives WHERE resident_medical_id = $1",
      [id]
    );
    const result = await query(
      "DELETE FROM resident_medicals WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) return sendError("Record not found", 404);
    return sendSuccess({ id }, "Resident medical record deleted");
  } catch (error) {
    console.error(error);
    return sendError("Failed to delete record");
  }
};
