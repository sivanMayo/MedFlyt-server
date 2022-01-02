import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import * as dbUtil from './../utils/dbUtil';

interface Report {
    year: number,
    caregivers: {
        name: string,
        patients: string[]
    }[]
}

export const getReport = async (req: Request, res: Response) => {

    const sql = `
        SELECT caregiver.name AS name, p.patients
        FROM caregiver
        JOIN(
            SELECT caregiver as id, array_agg(p.name) as patients
            FROM visit
            JOIN patient p ON p.id = visit.patient 
            WHERE date_part('year', visit.date) = ${req.params.year}
            GROUP BY visit.caregiver
        ) p USING (id)
    `;
    
    let result : QueryResult;
    try {
        result = await dbUtil.sqlToDB(sql, []);
        const report: Report = {
            year: parseInt(req.params.year),
            caregivers: result.rows
        };

        res.status(200).json(report);
    } catch (error) {
        throw new Error(error.message);
    }

}
