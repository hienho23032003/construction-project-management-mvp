using ConstructionManagement.Application.DTOs;
using FluentValidation;

namespace ConstructionManagement.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Vui lòng nhập địa chỉ Email.")
            .EmailAddress().WithMessage("Địa chỉ Email không đúng định dạng.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu.")
            .MinimumLength(6).WithMessage("Mật khẩu phải chứa ít nhất 6 ký tự.");
    }
}

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Vui lòng nhập họ và tên.")
            .MaximumLength(150).WithMessage("Họ và tên không được vượt quá 150 ký tự.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Vui lòng nhập địa chỉ Email.")
            .EmailAddress().WithMessage("Địa chỉ Email không đúng định dạng.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu.")
            .MinimumLength(6).WithMessage("Mật khẩu phải chứa ít nhất 6 ký tự.");
    }
}

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Vui lòng nhập họ và tên.")
            .MaximumLength(150).WithMessage("Họ và tên không được vượt quá 150 ký tự.");
    }
}

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Vui lòng nhập họ và tên.")
            .MaximumLength(150).WithMessage("Họ và tên không được vượt quá 150 ký tự.");
    }
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu hiện tại.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu mới.")
            .MinimumLength(6).WithMessage("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
    }
}

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Vui lòng nhập mã công trình/dự án.")
            .MaximumLength(50).WithMessage("Mã công trình không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Vui lòng nhập tên công trình/dự án.")
            .MaximumLength(200).WithMessage("Tên công trình không được vượt quá 200 ký tự.");

        RuleFor(x => x.PlannedEndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Ngày kết thúc dự kiến phải lớn hơn hoặc bằng ngày bắt đầu.");
    }
}

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Vui lòng nhập tên công trình/dự án.")
            .MaximumLength(200).WithMessage("Tên công trình không được vượt quá 200 ký tự.");

        RuleFor(x => x.PlannedEndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Ngày kết thúc dự kiến phải lớn hơn hoặc bằng ngày bắt đầu.");
    }
}

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Vui lòng chọn công trình/dự án.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Vui lòng nhập tên công việc.")
            .MaximumLength(250).WithMessage("Tên công việc không được vượt quá 250 ký tự.");

        RuleFor(x => x.PlannedEndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Ngày kết thúc dự kiến phải lớn hơn hoặc bằng ngày bắt đầu.");

        RuleFor(x => x.Progress)
            .InclusiveBetween(0, 100).WithMessage("Tiến độ công việc phải từ 0% đến 100%.");
    }
}

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Vui lòng nhập tên công việc.")
            .MaximumLength(250).WithMessage("Tên công việc không được vượt quá 250 ký tự.");

        RuleFor(x => x.PlannedEndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Ngày kết thúc dự kiến phải lớn hơn hoặc bằng ngày bắt đầu.");

        RuleFor(x => x.Progress)
            .InclusiveBetween(0, 100).WithMessage("Tiến độ công việc phải từ 0% đến 100%.");
    }
}

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Nội dung bình luận không được để trống.")
            .MaximumLength(2000).WithMessage("Nội dung bình luận tối đa 2000 ký tự.");
    }
}

public class AdminResetPasswordRequestValidator : AbstractValidator<AdminResetPasswordRequest>
{
    public AdminResetPasswordRequestValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu mới.")
            .MinimumLength(6).WithMessage("Mật khẩu mới phải từ 6 ký tự trở lên.");
    }
}
