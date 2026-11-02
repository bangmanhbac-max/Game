import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from ...db.session import get_db, engine

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.get("/admin/db/tables")
def get_db_tables(db: Session = Depends(get_db)):
    """Trả về danh sách tất cả các bảng trong Database, số lượng bản ghi và cấu trúc cột"""
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    
    tables_summary = []
    for t_name in table_names:
        # Lấy số hàng
        try:
            count_res = db.execute(text(f"SELECT COUNT(*) FROM {t_name}")).scalar()
        except Exception:
            count_res = 0

        # Lấy thông tin cột
        columns = inspector.get_columns(t_name)
        col_list = [{"name": c["name"], "type": str(c["type"])} for c in columns]

        tables_summary.append({
            "table_name": t_name,
            "row_count": count_res,
            "columns": col_list
        })

    return {
        "database_type": "SQLite 3",
        "total_tables": len(tables_summary),
        "tables": tables_summary
    }

@router.get("/admin/db/table/{table_name}")
def get_table_data(
    table_name: str, 
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Truy vấn dữ liệu chi tiết của 1 bảng trong Database"""
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail=f"Bảng {table_name} không tồn tại")

    columns = [c["name"] for c in inspector.get_columns(table_name)]

    try:
        # Build query
        where_clause = ""
        params = {}
        if search:
            # Tìm kiếm trên các cột dạng chuỗi
            search_conds = [f"{col} LIKE :search" for col in columns[:3]]
            where_clause = f"WHERE {' OR '.join(search_conds)}"
            params["search"] = f"%{search}%"

        sql = f"SELECT * FROM {table_name} {where_clause} LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset

        result = db.execute(text(sql), params)
        rows = [dict(row._mapping) for row in result]

        total_rows = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()

        return {
            "table_name": table_name,
            "columns": columns,
            "total_rows": total_rows,
            "rows": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn bảng: {str(e)}")

@router.delete("/admin/db/table/{table_name}/{row_id}")
def delete_table_row(table_name: str, row_id: str, db: Session = Depends(get_db)):
    """Xóa một bản ghi trong bảng dữ liệu"""
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Bảng không tồn tại")

    columns = [c["name"] for c in inspector.get_columns(table_name)]
    pk_col = "id" if "id" in columns else ("package_id" if "package_id" in columns else columns[0])

    try:
        db.execute(text(f"DELETE FROM {table_name} WHERE {pk_col} = :row_id"), {"row_id": row_id})
        db.commit()
        return {"status": "success", "message": f"Đã xóa bản ghi {row_id} khỏi bảng {table_name}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa: {str(e)}")

@router.post("/admin/db/query")
def run_custom_query(req: QueryRequest, db: Session = Depends(get_db)):
    """Chạy câu truy vấn SQL đọc (SELECT) trực tiếp từ giao diện Web Admin"""
    q = req.query.strip()
    if not q.upper().startswith("SELECT") and not q.upper().startswith("EXPLAIN"):
        raise HTTPException(status_code=400, detail="Chỉ cho phép thực thi các câu lệnh truy vấn đọc (SELECT)")

    try:
        res = db.execute(text(q))
        rows = [dict(row._mapping) for row in res]
        return {
            "status": "success",
            "row_count": len(rows),
            "rows": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi SQL: {str(e)}")
