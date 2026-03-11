from app.config import settings
print(f'MINIO_ENDPOINT: {settings.MINIO_ENDPOINT}')
print(f'MINIO_ACCESS_KEY: {settings.MINIO_ACCESS_KEY}')
print(f'MINIO_BUCKET: {settings.MINIO_BUCKET}')
print(f'STORAGE_TYPE: {settings.STORAGE_TYPE}')
