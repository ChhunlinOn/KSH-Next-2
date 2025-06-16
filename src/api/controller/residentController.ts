import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

// GET all residents
export const getResidents = async () => {
  try {
    const result = await query('SELECT * FROM residents');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
  }
};

// GET one resident
export const getOneResident = async (id: string) => {
  try {
    const result = await query('SELECT * FROM residents WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching resident:', error);
    return NextResponse.json({ error: 'Failed to fetch resident' }, { status: 500 });
  }
};

// POST: Create a new resident
export const createResident = async (req: NextRequest) => {
  try {
    const {
      fullname_en,
      fullname_kh,
      dob,
      type_of_disability,
      gender,
      profile,
      start_date,
      end_date,
    } = await req.json();

    const result = await query(
      `INSERT INTO residents (fullname_en, fullname_kh, dob, type_of_disability, gender, profile, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [fullname_en, fullname_kh, dob, type_of_disability, gender, profile, start_date, end_date]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating resident:', error);
    return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 });
  }
};

// PUT: Update resident
export const updateResident = async (req: NextRequest, id: string) => {
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
      return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
    }

    values.push(id);

    const result = await query(
      `UPDATE residents SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resident:', error);
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
};

// DELETE: Delete resident
export const deleteResident = async (id: string) => {
  try {
    const result = await query('DELETE FROM residents WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    return NextResponse.json({ message: `Resident with id ${id} deleted` });
  } catch (error) {
    console.error('Error deleting resident:', error);
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
};
