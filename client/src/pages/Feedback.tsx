import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Send, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

const sourceOptions = [
  "Facebook Ads",
  "Instagram Ads",
  "TikTok Ads",
  "Word of Mouth",
  "Billboards",
  "Google",
] as const;

const phonePrefixes = ["03", "70", "71", "76", "78", "79", "81"] as const;

const feedbackSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain digits only")
    .length(8, "Phone number must be exactly 8 digits")
    .refine(
      (value) => phonePrefixes.some((prefix) => value.startsWith(prefix)),
      "Phone number must start with 03, 70, 71, 76, 78, 79, or 81",
    ),
  source: z.enum(sourceOptions, {
    required_error: "Source of recognition is required",
  }),
  rating: z.number().min(1, "Please choose a rating").max(5),
  comment: z.string().trim().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

type FeedbackResponse = {
  message: string;
};

function getApiErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Failed to submit review";

  const jsonStart = error.message.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(error.message.slice(jsonStart)) as {
        message?: string;
      };
      if (parsed.message) return parsed.message;
    } catch {
      return error.message;
    }
  }

  return error.message || "Failed to submit review";
}

export default function FeedbackPage() {
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      source: undefined,
      rating: 0,
      comment: "",
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (values: FeedbackFormValues) => {
      const response = await apiRequest("POST", "/api/client-reviews", {
        fullName: values.fullName.trim(),
        phone: values.phone,
        source: values.source,
        rating: values.rating,
        comment: values.comment?.trim() || "",
      });

      return response.json() as Promise<FeedbackResponse>;
    },
    onSuccess: (data) => {
      form.reset({
        fullName: "",
        phone: "",
        source: undefined,
        rating: 0,
        comment: "",
      });

      toast({
        title: "Thank you",
        description: data.message || "Review submitted successfully",
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);

      form.setError("root.server", {
        type: "server",
        message,
      });

      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FeedbackFormValues) => {
    form.clearErrors("root.server");
    submitReviewMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-light-cream">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <Card className="w-full max-w-lg border-brand-green/20 shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-between gap-3">
              <Link href="/">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Menu
                </Button>
              </Link>
              <img
                src="/images/logo.png"
                alt="Chez Beyrouth Logo"
                className="h-16 w-auto object-contain sm:h-20"
              />
              <div className="w-[82px]" aria-hidden="true" />
            </div>

            <div className="pt-1">
              <CardTitle className="font-alethia text-2xl font-bold text-dark-brown sm:text-3xl">
                Customer Feedback
              </CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-saddle-brown sm:text-base">
                Tell us about your visit. It only takes a moment.
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-brown">
                        Full Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          autoComplete="name"
                          className="border-brand-green/30 text-brand-green placeholder:text-brand-green/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-brown">
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="03xxxxxx"
                          inputMode="numeric"
                          autoComplete="tel"
                          maxLength={8}
                          className="border-brand-green/30 text-brand-green placeholder:text-brand-green/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                          value={field.value}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          onChange={(event) => {
                            field.onChange(
                              event.target.value.replace(/\D/g, "").slice(0, 8),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-brown">
                        Source Of Recognition *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-brand-green/30 text-brand-green focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="How did you hear about us?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sourceOptions.map((source) => (
                            <SelectItem
                              key={source}
                              value={source}
                              className="text-brand-green"
                            >
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-brown">
                        Rating *
                      </FormLabel>
                      <FormControl>
                        <div
                          className="flex h-10 items-center gap-1 rounded-md border border-brand-green/30 bg-background px-3 py-2"
                          role="radiogroup"
                          aria-label="Rating"
                        >
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const isSelected = rating <= field.value;

                            return (
                              <button
                                key={rating}
                                type="button"
                                role="radio"
                                aria-checked={field.value === rating}
                                aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                                className="rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                onClick={() => field.onChange(rating)}
                              >
                                <Star
                                  className={cn(
                                    "h-[18px] w-[18px] transition-colors sm:h-5 sm:w-5",
                                    isSelected
                                      ? "text-[#B78A28]"
                                      : "text-brand-green/35",
                                  )}
                                  fill={isSelected ? "currentColor" : "none"}
                                  strokeWidth={2.25}
                                />
                              </button>
                            );
                          })}
                          {field.value ? (
                            <span className="ml-2 translate-y-[1px] text-sm font-medium leading-none text-saddle-brown">
                              {field.value}/5
                            </span>
                          ) : null}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-brown">
                        Comment
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share anything we should know"
                          className="min-h-28 resize-none border-brand-green/30 text-brand-green placeholder:text-brand-green/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root?.server?.message ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                    {form.formState.errors.root.server.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="outline"
                  disabled={submitReviewMutation.isPending}
                  className="h-11 w-full border-[#527A53]/30 bg-white text-[#527A53] hover:bg-[#527A53] hover:text-white"
                >
                  {submitReviewMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
