using Microsoft.AspNetCore.Identity;

namespace School_Management.API.ErrorMessageConfiguration
{
    public class VietnameseIdentityErrorDescriber : IdentityErrorDescriber
    {
        public override IdentityError DuplicateEmail(string email)
                    => new IdentityError { Code = nameof(DuplicateEmail), Description = $"Email '{email}' đã được đăng ký bởi người khác." };

        public override IdentityError DuplicateUserName(string userName)
            => new IdentityError { Code = nameof(DuplicateUserName), Description = $"Tên đăng nhập '{userName}' đã tồn tại." };

        public override IdentityError InvalidEmail(string email)
            => new IdentityError { Code = nameof(InvalidEmail), Description = $"Định dạng Email '{email}' không hợp lệ." };

        public override IdentityError InvalidUserName(string userName)
            => new IdentityError { Code = nameof(InvalidUserName), Description = $"Tên đăng nhập '{userName}' không hợp lệ, chỉ được chứa chữ cái và số." };

        public override IdentityError UserAlreadyInRole(string role)
            => new IdentityError { Code = nameof(UserAlreadyInRole), Description = $"Người dùng đã có quyền '{role}' rồi." };

        public override IdentityError UserNotInRole(string role)
            => new IdentityError { Code = nameof(UserNotInRole), Description = $"Người dùng không có quyền '{role}'." };

        public override IdentityError UserLockoutNotEnabled()
            => new IdentityError { Code = nameof(UserLockoutNotEnabled), Description = "Tài khoản này hiện đang bị tạm khóa." };
        

        // --- LỖI VỀ PASSWORD (MẬT KHẨU) ---
        public override IdentityError PasswordTooShort(int length)
            => new IdentityError { Code = nameof(PasswordTooShort), Description = $"Mật khẩu phải có ít nhất {length} ký tự." };

        public override IdentityError PasswordRequiresUpper()
            => new IdentityError { Code = nameof(PasswordRequiresUpper), Description = "Mật khẩu phải có ít nhất một chữ cái viết hoa ('A'-'Z')." };

        public override IdentityError PasswordRequiresLower()
            => new IdentityError { Code = nameof(PasswordRequiresLower), Description = "Mật khẩu phải có ít nhất một chữ cái viết thường ('a'-'z')." };

        public override IdentityError PasswordRequiresDigit()
            => new IdentityError { Code = nameof(PasswordRequiresDigit), Description = "Mật khẩu phải chứa ít nhất một chữ số ('0'-'9')." };

        public override IdentityError PasswordRequiresNonAlphanumeric()
            => new IdentityError { Code = nameof(PasswordRequiresNonAlphanumeric), Description = "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (ví dụ: @, #, $)." };

        public override IdentityError PasswordRequiresUniqueChars(int uniqueChars)
            => new IdentityError { Code = nameof(PasswordRequiresUniqueChars), Description = $"Mật khẩu phải chứa ít nhất {uniqueChars} ký tự khác nhau." };

        public override IdentityError PasswordMismatch()
            => new IdentityError { Code = nameof(PasswordMismatch), Description = "Mật khẩu xác nhận không khớp." };

        // --- LỖI VỀ ROLE (QUYỀN/VAI TRÒ) ---
        public override IdentityError DuplicateRoleName(string role)
            => new IdentityError { Code = nameof(DuplicateRoleName), Description = $"Tên quyền '{role}' đã tồn tại." };

        public override IdentityError InvalidRoleName(string role)
            => new IdentityError { Code = nameof(InvalidRoleName), Description = $"Tên quyền '{role}' không hợp lệ." };

        // --- LỖI HỆ THỐNG & TOKEN ---
        public override IdentityError ConcurrencyFailure()
            => new IdentityError { Code = nameof(ConcurrencyFailure), Description = "Lỗi cập nhật dữ liệu đồng thời. Vui lòng tải lại trang và thử lại." };

        public override IdentityError DefaultError()
            => new IdentityError { Code = nameof(DefaultError), Description = "Đã xảy ra lỗi hệ thống không xác định." };

        public override IdentityError InvalidToken()
            => new IdentityError { Code = nameof(InvalidToken), Description = "Mã xác thực (Token) không hợp lệ hoặc đã hết hạn." };

        public override IdentityError RecoveryCodeRedemptionFailed()
            => new IdentityError { Code = nameof(RecoveryCodeRedemptionFailed), Description = "Sử dụng mã phục hồi thất bại." };
    }
}
