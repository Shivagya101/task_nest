import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useRegisterMutation, useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { useState } from "react";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (data) => {
    setIsSubmitting(true);
    try {
      // Register the user
      await registerUser(data).unwrap();
      // Auto-login after registration
      const loginRes = await login({ email: data.email, password: data.password }).unwrap();
      dispatch(setCredentials(loginRes));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base dark:border-gray-700 dark:text-blue-400 border-gray-300 text-gray-600'>
              Create your account to manage tasks!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center dark:text-gray-400 text-blue-700'>
              <span>Sign Up</span>
              <span>for Task Manager</span>
            </p>
            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(handleRegister)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white dark:bg-slate-900 px-10 pt-14 pb-14'
          >
            <div>
              <p className='text-blue-600 text-3xl font-bold text-center'>
                Register
              </p>
              <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                Create your account to get started!
              </p>
            </div>
            <div className='flex flex-col gap-y-5'>
              <Textbox
                placeholder='Your Name'
                type='text'
                name='name'
                label='Name'
                className='w-full rounded-full'
                register={register("name", {
                  required: "Name is required!",
                })}
                error={errors.name ? errors.name.message : ""}
              />
              <Textbox
                placeholder='you@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder='password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={register("password", {
                  required: "Password is required!",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                error={errors.password ? errors.password?.message : ""}
              />
              <Textbox
                placeholder='Developer, Manager, etc.'
                type='text'
                name='title'
                label='Title'
                className='w-full rounded-full'
                register={register("title", {
                  required: "Title is required!",
                })}
                error={errors.title ? errors.title.message : ""}
              />
              <Textbox
                placeholder='user, admin, etc.'
                type='text'
                name='role'
                label='Role'
                className='w-full rounded-full'
                register={register("role", {
                  required: "Role is required!",
                })}
                error={errors.role ? errors.role.message : ""}
              />
            </div>
            {isRegistering || isLoggingIn || isSubmitting ? (
              <Loading />
            ) : (
              <Button
                type='submit'
                label='Register'
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              />
            )}
            <p className='text-center text-sm text-gray-600 mt-2'>
              Already have an account?{' '}
              <Link to="/login" className='text-blue-600 hover:underline'>Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 