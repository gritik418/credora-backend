import { Prisma, Skill } from 'generated/prisma/client';

export interface Connection {
  id: string;
  userId: string;

  connection: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar: string | null;
  };
  createdAt: Date;
}

export interface SuggestedPeople {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  isVerified: boolean;
  profile: {
    headline: string | null;
    industry: string | null;
    city: string | null;
    profession: string | null;
    skills: Skill[] | null;
    educations: {
      institution: string;
    }[];
    experiences: {
      company: string;
    }[];
  };
  is2ndDegree: boolean;
  is3rdDegree: boolean;
  matchReasons: string[];
}

export type MatchReason =
  | 'search'
  | 'second-degree'
  | 'third-degree'
  | 'industry'
  | 'profession'
  | 'headline'
  | 'skills'
  | 'bio'
  | 'city'
  | 'institution'
  | 'company';

export type UserAsSuggestedPeoplePayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    username: true;
    avatar: true;
    isVerified: true;
    profile: {
      select: {
        headline: true;
        industry: true;
        city: true;
        profession: true;
        bio: true;
        skills: true;
        educations: {
          select: {
            institution: true;
          };
        };
        experiences: {
          select: {
            company: true;
          };
        };
      };
    };
  };
}>;
