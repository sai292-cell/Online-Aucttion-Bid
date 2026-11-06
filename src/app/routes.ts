import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, sellerGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Auctions
  {
    path: 'auctions',
    loadComponent: () => import('./features/auctions/browse/browse.component').then(m => m.BrowseComponent)
  },
  {
    path: 'auctions/:id',
    loadComponent: () => import('./features/auctions/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: 'auction/:id',
    redirectTo: 'auctions/:id'
  },

  // Auth
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Buyer Dashboard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Checkout & Orders
  {
    path: 'checkout/orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/order-history/order-history.component').then(m => m.OrderHistoryComponent)
  },
  {
    path: 'checkout/confirmation/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  {
    path: 'checkout/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/checkout/checkout.component').then(m => m.CheckoutComponent)
  },

  // Seller Section
  {
    path: 'seller/new',
    canActivate: [authGuard, sellerGuard],
    loadComponent: () => import('./features/seller/sell-item/sell-item.component').then(m => m.SellItemComponent)
  },
  {
    path: 'seller/listings',
    canActivate: [authGuard, sellerGuard],
    loadComponent: () => import('./features/seller/my-listings/my-listings.component').then(m => m.MyListingsComponent)
  },

  // Admin Section
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },

  // Extra Pages
  {
    path: 'about',
    loadComponent: () => import('./features/extra/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./features/extra/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/extra/faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/extra/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./features/extra/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
