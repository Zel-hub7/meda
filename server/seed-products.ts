import { getUncachableStripeClient } from './stripeClient';

const PLANS = [
  {
    name: 'Starter',
    planKey: 'starter',
    price: 9900, // $99.00 in cents
    description: 'Perfect for small teams getting started with AI-powered knowledge management',
    features: [
      '20 AI suggestions/month',
      '1 source integration (Slack or Drive)',
      'Up to 5 team members',
      'Manual approvals only',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    planKey: 'growth',
    price: 29900, // $299.00 in cents
    description: 'For growing teams that need more capacity and automation',
    features: [
      '75 AI suggestions/month',
      '2 source integrations',
      'Up to 15 team members',
      'Auto-approval for high confidence',
      'Priority support',
    ],
  },
  {
    name: 'Scale',
    planKey: 'scale',
    price: 59900, // $599.00 in cents
    description: 'For organizations that need full power and all integrations',
    features: [
      '200 AI suggestions/month',
      'All 4 source integrations',
      'Up to 30 team members',
      'API access',
      'Dedicated support',
    ],
  },
  {
    name: 'Pro Scale',
    planKey: 'pro_scale',
    price: 99900, // $999.00 in cents
    description: 'Unlimited power for large organizations',
    features: [
      'Unlimited AI suggestions',
      'Unlimited source integrations',
      'Up to 75 team members',
      'Audit logs & compliance',
      'Custom integrations',
    ],
  },
];

async function seedProducts() {
  console.log('Starting Stripe product seeding...');
  
  const stripe = await getUncachableStripeClient();
  
  for (const plan of PLANS) {
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: `name:'${plan.name}'`,
    });
    
    if (existingProducts.data.length > 0) {
      console.log(`Product "${plan.name}" already exists, skipping...`);
      continue;
    }
    
    console.log(`Creating product: ${plan.name}`);
    
    // Create the product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan: plan.planKey,
        features: JSON.stringify(plan.features),
      },
    });
    
    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: plan.planKey,
        billing_period: 'monthly',
      },
    });
    
    // Create yearly price (2 months free = ~17% discount)
    const yearlyAmount = plan.price * 10; // 10 months worth for yearly
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: yearlyAmount,
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: plan.planKey,
        billing_period: 'yearly',
      },
    });
    
    console.log(`  Created product: ${product.id}`);
    console.log(`  Monthly price: ${monthlyPrice.id} ($${plan.price / 100}/mo)`);
    console.log(`  Yearly price: ${yearlyPrice.id} ($${yearlyAmount / 100}/yr)`);
  }
  
  console.log('\nDone seeding Stripe products!');
}

seedProducts().catch(console.error);
