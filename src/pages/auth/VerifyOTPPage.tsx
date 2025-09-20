import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { useCountdown } from "@/hooks/useCountdown";
import { authApi } from "@/services/api/auth";
import { useToast } from "@/hooks/use-toast";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export const VerifyOTPPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const email = location.state?.email;

  const { timeLeft, isRunning, start, reset, formatTime } = useCountdown({
    initialTime: 300, // 5 minutes
    onComplete: () => {
      toast({
        variant: "destructive",
        title: "OTP Expired",
        description: "Please request a new OTP code.",
      });
    },
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!email) {
      navigate("/auth/signup");
      return;
    }
    start();
  }, [email, navigate, start]);

  const onSubmit = async (data: OTPFormData) => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP({
        email,
        otp: data.otp,
      });

      if (response.success) {
        toast({
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        });
        navigate("/auth/login");
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description:
            response.message || "Invalid OTP code. Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const response = await authApi.resendOTP(email);

      if (response.success) {
        toast({
          title: "OTP sent",
          description: "A new OTP code has been sent to your email.",
        });
        reset(300); // Reset to 5 minutes
        start();
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send OTP",
          description: response.message || "Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      title="Verify your email"
      description={`We've sent a 6-digit code to ${email}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center block">
                  Enter verification code
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-center">
            {isRunning && timeLeft > 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                Code expires in{" "}
                <span className="font-mono font-semibold text-primary">
                  {formatTime(timeLeft)}
                </span>
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={isResending}
                >
                  {isResending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Resend Code
                </Button>
              </motion.div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || form.watch("otp").length !== 6}
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Verify Email
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Go back
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};
