from . import models
from .auth import get_password_hash

def init_db():
    """Initialize database and create tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create default admin user if not exists
        create_default_admin()
        
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

def create_default_admin():
    """Create default admin user"""
    from config import Config
    
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(models.User).filter(
            models.User.username == Config.ADMIN_USERNAME
        ).first()
        
        if not existing_admin:
            # Create default admin
            admin_user = models.User(
                username=Config.ADMIN_USERNAME,
                email=Config.ADMIN_EMAIL,
                full_name="System Administrator",
                hashed_password=get_password_hash(Config.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True
            )
            
            db.add(admin_user)
            db.commit()
            logger.info("Default admin user created")
        else:
            logger.info("Admin user already exists")
            
    except Exception as e:
        logger.error(f"Failed to create admin user: {e}")
        db.rollback()
    finally:
        db.close()