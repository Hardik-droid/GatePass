from fastapi import HTTPException


class AppError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(
            status_code=status_code,
            detail={"error": code, "message": message},
        )


def invariant(condition: object, status_code: int, code: str, message: str) -> None:
    if not condition:
        raise AppError(status_code, code, message)
