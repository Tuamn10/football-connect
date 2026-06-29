from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.football_field import FootballField
from app.models.field_review import FieldReview
from app.models.match_participant import MatchParticipant
from app.models.post import Post
from app.models.report import Report
from app.models.saved_post import SavedPost
from app.models.user import User


def get_or_create_user(db, name, email, password, role, phone, area, position=None, level="average"):
    user = db.query(User).filter(User.email == email).first()

    if user:
        return user

    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        role=role,
        phone=phone,
        area=area,
        position=position,
        level=level,
        status="active",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_or_create_field(
    db,
    owner_id,
    name,
    address,
    area,
    phone,
    field_type,
    price_per_hour,
    latitude,
    longitude,
    description,
):
    field = db.query(FootballField).filter(FootballField.name == name).first()

    if field:
        return field

    field = FootballField(
        owner_id=owner_id,
        name=name,
        address=address,
        area=area,
        phone=phone,
        field_type=field_type,
        price_per_hour=price_per_hour,
        open_time="06:00",
        close_time="23:00",
        latitude=latitude,
        longitude=longitude,
        image="https://example.com/football-field.jpg",
        description=description,
        status="active",
    )

    db.add(field)
    db.commit()
    db.refresh(field)

    return field


def get_or_create_post(
    db,
    user_id,
    field_id,
    title,
    post_type,
    match_time,
    area,
    field_type,
    needed_players,
    current_players,
    required_level,
    cost,
    description,
    status="open",
    contact_phone=None,
):
    post = db.query(Post).filter(Post.title == title).first()

    if post:
        return post

    post = Post(
        user_id=user_id,
        field_id=field_id,
        title=title,
        post_type=post_type,
        match_time=match_time,
        area=area,
        field_type=field_type,
        needed_players=needed_players,
        current_players=current_players,
        required_level=required_level,
        cost=cost,
        description=description,
        status=status,
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


def get_or_create_participant(db, post_id, user_id, note, participant_status):
    participant = (
        db.query(MatchParticipant)
        .filter(
            MatchParticipant.post_id == post_id,
            MatchParticipant.user_id == user_id,
        )
        .first()
    )

    if participant:
        return participant

    participant = MatchParticipant(
        post_id=post_id,
        user_id=user_id,
        note=note,
        status=participant_status,
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


def get_or_create_saved_post(db, user_id, post_id):
    saved_post = (
        db.query(SavedPost)
        .filter(
            SavedPost.user_id == user_id,
            SavedPost.post_id == post_id,
        )
        .first()
    )

    if saved_post:
        return saved_post

    saved_post = SavedPost(
        user_id=user_id,
        post_id=post_id,
    )

    db.add(saved_post)
    db.commit()
    db.refresh(saved_post)

    return saved_post


def get_or_create_report(db, user_id, post_id, reason, description):
    report = (
        db.query(Report)
        .filter(
            Report.user_id == user_id,
            Report.post_id == post_id,
            Report.reason == reason,
        )
        .first()
    )

    if report:
        return report

    report = Report(
        user_id=user_id,
        post_id=post_id,
        reason=reason,
        description=description,
        status="pending",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_or_create_review(db, field_id, user_id, rating, comment):
    review = (
        db.query(FieldReview)
        .filter(
            FieldReview.field_id == field_id,
            FieldReview.user_id == user_id,
        )
        .first()
    )

    if review:
        return review

    review = FieldReview(
        field_id=field_id,
        user_id=user_id,
        rating=rating,
        comment=comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


def seed_demo_data():
    db = SessionLocal()

    try:
        # =========================
        # USERS
        # =========================

        admin = get_or_create_user(
            db=db,
            name="Admin Football Connect",
            email="admin@gmail.com",
            password="123456",
            role="admin",
            phone="0900000001",
            area="Ha Noi",
            position=None,
            level="advanced",
        )

        owner_1 = get_or_create_user(
            db=db,
            name="Chủ sân Mỹ Đình",
            email="owner@gmail.com",
            password="123456",
            role="field_owner",
            phone="0900000002",
            area="Nam Tu Liem",
            position=None,
            level="average",
        )

        owner_2 = get_or_create_user(
            db=db,
            name="Chủ sân Cầu Giấy",
            email="owner2@gmail.com",
            password="123456",
            role="field_owner",
            phone="0900000003",
            area="Cau Giay",
            position=None,
            level="average",
        )

        player_1 = get_or_create_user(
            db=db,
            name="Nguyễn Văn Nam",
            email="player@gmail.com",
            password="123456",
            role="user",
            phone="0911000001",
            area="Nam Tu Liem",
            position="midfielder",
            level="average",
        )

        player_2 = get_or_create_user(
            db=db,
            name="Trần Minh Đức",
            email="player2@gmail.com",
            password="123456",
            role="user",
            phone="0911000002",
            area="Cau Giay",
            position="defender",
            level="good",
        )

        player_3 = get_or_create_user(
            db=db,
            name="Lê Hoàng Long",
            email="player3@gmail.com",
            password="123456",
            role="user",
            phone="0911000003",
            area="Thanh Xuan",
            position="forward",
            level="average",
        )

        player_4 = get_or_create_user(
            db=db,
            name="Phạm Anh Quân",
            email="player4@gmail.com",
            password="123456",
            role="user",
            phone="0911000004",
            area="Hoan Kiem",
            position="goalkeeper",
            level="good",
        )

        # =========================
        # FIELDS - HANOI ONLY
        # =========================

        field_1 = get_or_create_field(
            db=db,
            owner_id=owner_1.id,
            name="Sân bóng Mỹ Đình",
            address="Đường Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
            area="Nam Tu Liem",
            phone="0988000001",
            field_type="7",
            price_per_hour=500000,
            latitude=21.0209,
            longitude=105.7631,
            description="Sân cỏ nhân tạo, có đèn chiếu sáng, phù hợp đá sân 7.",
        )

        field_2 = get_or_create_field(
            db=db,
            owner_id=owner_2.id,
            name="Sân bóng Cầu Giấy",
            address="Đường Dương Quảng Hàm, Cầu Giấy, Hà Nội",
            area="Cau Giay",
            phone="0988000002",
            field_type="7",
            price_per_hour=450000,
            latitude=21.0379,
            longitude=105.7902,
            description="Sân rộng, có chỗ gửi xe, gần khu sinh viên.",
        )

        field_3 = get_or_create_field(
            db=db,
            owner_id=owner_1.id,
            name="Sân bóng Thanh Xuân",
            address="Đường Nguyễn Trãi, Thanh Xuân, Hà Nội",
            area="Thanh Xuan",
            phone="0988000003",
            field_type="5",
            price_per_hour=350000,
            latitude=20.9986,
            longitude=105.8122,
            description="Sân 5 người, phù hợp đá giao lưu buổi tối.",
        )

        field_4 = get_or_create_field(
            db=db,
            owner_id=owner_2.id,
            name="Sân bóng Hoàn Kiếm",
            address="Khu vực Hoàn Kiếm, Hà Nội",
            area="Hoan Kiem",
            phone="0988000004",
            field_type="5",
            price_per_hour=400000,
            latitude=21.0285,
            longitude=105.8542,
            description="Sân trung tâm, thuận tiện di chuyển.",
        )

        # =========================
        # POSTS
        # =========================

        now = datetime.now(timezone.utc)

        post_1 = get_or_create_post(
            db=db,
            user_id=player_1.id,
            field_id=field_1.id,
            title="Cần 2 bạn đá sân 7 tối nay tại Mỹ Đình",
            post_type="find_player",
            match_time=now + timedelta(days=1, hours=2),
            area="Nam Tu Liem",
            field_type="7",
            needed_players=2,
            current_players=1,
            required_level="average",
            cost=80000,
            description="Đội mình thiếu 2 bạn đá giao lưu, vui vẻ, không đá rắn.",
            status="open",
        )

        post_2 = get_or_create_post(
            db=db,
            user_id=player_2.id,
            field_id=field_2.id,
            title="Tìm đối đá giao lưu sân 7 khu Cầu Giấy",
            post_type="find_opponent",
            match_time=now + timedelta(days=2, hours=3),
            area="Cau Giay",
            field_type="7",
            needed_players=0,
            current_players=7,
            required_level="good",
            cost=600000,
            description="Đội đã có đủ người, cần tìm đội đối đá giao lưu.",
            status="open",
        )

        post_3 = get_or_create_post(
            db=db,
            user_id=owner_1.id,
            field_id=field_3.id,
            title="Sân Thanh Xuân trống khung 19h hôm nay",
            post_type="pass_field",
            match_time=now + timedelta(hours=5),
            area="Thanh Xuan",
            field_type="5",
            needed_players=0,
            current_players=0,
            required_level="average",
            cost=350000,
            description="Sân còn trống khung 19h-20h30, liên hệ đặt sân nhanh.",
            status="open",
        )

        post_4 = get_or_create_post(
            db=db,
            user_id=player_3.id,
            field_id=field_4.id,
            title="Tìm người đá sân 5 khu Hoàn Kiếm",
            post_type="find_player",
            match_time=now + timedelta(days=3, hours=1),
            area="Hoan Kiem",
            field_type="5",
            needed_players=1,
            current_players=4,
            required_level="good",
            cost=70000,
            contact_phone="0911222333",
            description="Đội thiếu 1 bạn, đá vui vẻ, chia tiền sân đều.",
            status="open",
        )

        post_5 = get_or_create_post(
            db=db,
            user_id=player_4.id,
            field_id=field_1.id,
            title="Tìm sân trống thứ 4 hàng tuần",
            post_type="find_field",
            match_time=now + timedelta(days=4, hours=2),
            area="Nam Tu Liem",
            field_type="7",
            needed_players=0,
            current_players=0,
            required_level="average",
            cost=0,
            contact_phone="0911222334",
            description="Đội mình cần tìm sân cố định tối thứ 4 quanh Nam Từ Liêm.",
            status="open",
        )

        post_6 = get_or_create_post(
            db=db,
            user_id=player_2.id,
            field_id=field_3.id,
            title="Bài đăng cũ đã hết hạn",
            post_type="find_player",
            match_time=now - timedelta(days=2),
            area="Thanh Xuan",
            field_type="5",
            needed_players=1,
            current_players=0,
            required_level="beginner",
            cost=50000,
            description="Bài đăng dùng để demo trạng thái hết hạn.",
            status="expired",
        )

        # =========================
        # PARTICIPANTS
        # =========================

        get_or_create_participant(
            db=db,
            post_id=post_1.id,
            user_id=player_2.id,
            note="Mình đá hậu vệ, có thể tham gia đúng giờ.",
            participant_status="approved",
        )

        get_or_create_participant(
            db=db,
            post_id=post_1.id,
            user_id=player_3.id,
            note="Mình đá tiền đạo, xin tham gia.",
            participant_status="pending",
        )

        get_or_create_participant(
            db=db,
            post_id=post_4.id,
            user_id=player_4.id,
            note="Mình bắt gôn ổn, có thể tham gia.",
            participant_status="approved",
        )

        # =========================
        # SAVED POSTS
        # =========================

        get_or_create_saved_post(db=db, user_id=player_1.id, post_id=post_2.id)
        get_or_create_saved_post(db=db, user_id=player_1.id, post_id=post_4.id)
        get_or_create_saved_post(db=db, user_id=player_2.id, post_id=post_3.id)
        get_or_create_saved_post(db=db, user_id=player_3.id, post_id=post_5.id)

        # =========================
        # REPORTS
        # =========================

        get_or_create_report(
            db=db,
            user_id=player_1.id,
            post_id=post_6.id,
            reason="false_information",
            description="Bài đăng đã quá thời gian nhưng vẫn còn hiển thị trong hệ thống.",
        )

        get_or_create_report(
            db=db,
            user_id=player_2.id,
            post_id=post_3.id,
            reason="spam",
            description="Nội dung bài đăng cần được admin kiểm tra lại.",
        )

        # =========================
        # FIELD REVIEWS
        # =========================

        get_or_create_review(
            db=db,
            field_id=field_1.id,
            user_id=player_1.id,
            rating=5,
            comment="Sân đẹp, mặt cỏ tốt, đèn sáng.",
        )

        get_or_create_review(
            db=db,
            field_id=field_1.id,
            user_id=player_2.id,
            rating=4,
            comment="Sân ổn, vị trí dễ tìm, hơi đông vào buổi tối.",
        )

        get_or_create_review(
            db=db,
            field_id=field_2.id,
            user_id=player_3.id,
            rating=5,
            comment="Sân rộng, có chỗ gửi xe thuận tiện.",
        )

        get_or_create_review(
            db=db,
            field_id=field_3.id,
            user_id=player_4.id,
            rating=4,
            comment="Phù hợp đá sân 5, giá hợp lý.",
        )

        print("Demo data seeded successfully.")
        print("")
        print("Demo accounts:")
        print("Admin:       admin@gmail.com / 123456")
        print("Owner 1:     owner@gmail.com / 123456")
        print("Owner 2:     owner2@gmail.com / 123456")
        print("Player 1:    player@gmail.com / 123456")
        print("Player 2:    player2@gmail.com / 123456")
        print("Player 3:    player3@gmail.com / 123456")
        print("Player 4:    player4@gmail.com / 123456")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()