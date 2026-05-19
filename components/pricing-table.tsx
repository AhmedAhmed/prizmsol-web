"use client"

import { PLAN_CREDIT_USD_DEFAULT } from "@/lib/plan-credit-defaults"
import { cn } from "@/lib/utils"
import isEmpty from "lodash/isEmpty"
import { Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"

type Package = {
  name: string;
  price: string;
  description: string;
  credits: string;
  buttonText: string;
  buttonHref: string;
  features: string[];
  featured?: boolean;
  contact?: boolean;
  priceId?: string;
  current?: boolean;
  isCancelable?: boolean;
}

export default function PricingTable(props: { compact?: boolean, user: any }) {
  const router = useRouter();
  const [plan, setPlan] = useState<string>("Free");
  const [loading, setLoading] = useState<boolean>(true);

  const getPlan = async () => {
    const request = await fetch(`/api/billing/subscription`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { plan: defaultPlan } = await request.json();
    setPlan(defaultPlan?.name || "Free");
    setLoading(false);
  }

  useEffect(() => {
    if (props.user) {
      getPlan();
    } else {
      setLoading(false);
    }
  }, []);

  const renderPackage = () => {
    const packages: Package[] = [
      {
        name: "Free",
        price: "$0",
        description: "For getting started",
        credits: `$${PLAN_CREDIT_USD_DEFAULT.free} of AI usage per month`,
        buttonText: plan == "Free" ? "Current plan" : "Cancel Plan",
        buttonHref: "/billing",
        current: plan === "Free",
        isCancelable: plan !== "Free",
        features: [
          `$${PLAN_CREDIT_USD_DEFAULT.free} of AI usage per month`,
          "Image search and documents",
        ],
      },
      {
        name: "Pro",
        price: "$25",
        description: "For everyone",
        credits: `$${PLAN_CREDIT_USD_DEFAULT.pro} of AI usage per month`,
        buttonText: plan == "Pro" ? "Current plan" : plan == "Max" ? "Cancel Plan" : "Get Pro plan",
        buttonHref: "/billing",
        features: [
          "Everything in Free",
          `$${PLAN_CREDIT_USD_DEFAULT.pro} of AI usage per month`,
          "Higher limits than Free",
        ],
        featured: true,
        current: plan === "Pro",
        isCancelable: plan == "Max",
        priceId: "price_1RX0zlHUC1uV0eTvi23oe4Oo",
      },
      {
        name: "Max",
        price: "$200",
        description: "For power users",
        credits: `$${PLAN_CREDIT_USD_DEFAULT.max} of AI usage per month`,
        buttonText: plan == "Max" ? "Current plan" : "Get Max plan",
        buttonHref: "/billing",
        features: [
          "Everything in Pro",
          `$${PLAN_CREDIT_USD_DEFAULT.max} of AI usage per month`,
          "Highest usage limits",
        ],
        featured: false,
        current: plan === "Max",
        isCancelable: false,
        priceId: "price_1RX0zhHUC1uV0eTvk1fhyMwi",
      }
    ];
    // update buttonhref to /billing if user is logged in
    if (props.user) {
      packages.forEach((pkg) => {
        pkg.buttonHref = "/billing";
      });
    } else {
      packages.forEach((pkg) => {
        pkg.buttonText = "Sign up";
        pkg.buttonHref = "/signup";
      });
    }
    return packages;
  }

  const packages = renderPackage();

  const subscribe = async (priceId: string) => {
    const response = await fetch(`/api/billing/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: priceId,
      }),
    });
    const { data } = await response.json();
    if (data?.url) {
      // redirect to checkout page.
      window.location.href = data.url;
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  const handlePriceForm = (url: string) => async (formData: FormData) => {
    if (isEmpty(props.user)) {
      router.push("/login");
      return;
    }
    if (isEmpty(url)) {
      router.push(url);
      return;
    }
    const priceId = formData.get("priceId") as string;
    const cancel = formData.get("cancel") as string;
    if (cancel === "true") {
      const response = await fetch(`/api/billing/subscription/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data } = await response.json();
      if (data) {
        toast.success("Subscription cancelled successfully");
        window.location.href = "/billing";
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      setLoading(true);
      subscribe(priceId);
    }
  }

  return (
    <div className="flex flex-1 justify-center items-center py-8 transition-colors duration-300">
      <div className={cn("w-full lg:max-w-7xl", {
        "mx-auto px-4 sm:px-6 lg:px-8": !props.compact,
        "mx-5": props.compact,
      })}>
        {!props.compact && <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
            Plans that grow with you
          </p>
        </div>}
        <div className="grid gap-6 lg:gap-0 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`flex flex-col rounded-lg shadow-lg overflow-hidden ${pkg.featured
                ? "border-2 border-blue-500 dark:border-blue-400 transform scale-105 transition-all duration-300 ease-in-out hover:scale-110"
                : "border border-neutral-200 dark:border-neutral-700"
                }`}
            >
              <div className="px-4 py-5 bg-neutral-50 dark:bg-neutral-800">
                <div>
                  <h3 className="inline-flex px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300">
                    {pkg.name}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{pkg.description}</p>
                {pkg.contact ? (
                  <div className="flex flex-col">
                    <h1 className="text-4xl py-2 font-bold text-neutral-900 dark:text-neutral-100">Custom</h1>
                    <Button
                      className={`mt-4 block w-full px-4 py-2 border border-transparent text-center text-sm font-medium rounded-md text-white ${pkg.featured
                        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        } transition-colors duration-300`}
                    >
                      <Link href="/contact/sales" className="text-white">Contact us</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex items-baseline text-5xl font-extrabold text-neutral-900 dark:text-neutral-100">
                      {pkg.price}
                      <span className="ml-1 text-xl font-medium text-neutral-500 dark:text-neutral-400">/month</span>
                    </div>
                    <form action={handlePriceForm(pkg.buttonHref)} className="mt-4">
                      <input type="hidden" name="priceId" value={pkg.priceId} />
                      <input type="hidden" name="cancel" value={pkg.isCancelable ? "true" : "false"} />
                      {loading ? (
                        <div className="animate-pulse h-[40px] rounded-md bg-neutral-200 dark:bg-neutral-700 w-full"></div>
                      ) : (<Button
                        className={`cursor-pointer block w-full px-4 py-2 border border-transparent text-center text-sm font-medium rounded-md text-white ${pkg.featured
                          ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                          : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                          } transition-colors duration-300`}
                        disabled={pkg.name === plan}
                      >
                        <span className="text-white">
                          {pkg.buttonText}
                        </span>
                      </Button>)}
                    </form>
                  </>
                )}
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{pkg.credits}</p>
              </div>
              <div className="flex-1 flex flex-col justify-between px-4 pt-4 pb-6 bg-neutral-100 dark:bg-neutral-900 space-y-4 border-t border-neutral-200 dark:border-neutral-700">
                <ul className="space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="items center shrink-0">
                        <Check className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                      </div>
                      <p className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {pkg.featured && (
                <div className="absolute top-0 right-0 mt-2 mr-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-600 text-white dark:bg-rose-500 dark:text-white">
                    Popular
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
