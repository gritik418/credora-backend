import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import {
  Connection,
  MatchReason,
  SuggestedPeople,
  UserAsSuggestedPeoplePayload,
} from './interfaces/connections.interface';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getConnections(req: Request) {
    const userId = req.user.id;

    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
        isEmailVerified: true,
        isActive: true,
      },
      include: {
        connectionsAsUserOne: {
          include: {
            userTwo: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        connectionsAsUserTwo: {
          include: {
            userOne: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Unauthorized.');

    const connections: Connection[] = [
      ...user.connectionsAsUserOne.map((connection) => {
        return {
          id: connection.id,
          userId: user.id,
          connection: connection.userTwo,
          createdAt: connection.createdAt,
        };
      }),

      ...user.connectionsAsUserTwo.map((connection) => {
        return {
          id: connection.id,
          userId: user.id,
          connection: connection.userOne,
          createdAt: connection.createdAt,
        };
      }),
    ];

    return {
      success: true,
      message: 'Connections fetched successfully.',
      data: { connections },
    };
  }

  async getSuggestedPeople(req: Request) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const parsedLimit =
      typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 50;

    const parsedPage =
      typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1;

    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 50;

    const page = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;

    const skip = (page - 1) * limit;

    const searchTerms = search.split(/\s+/).filter(Boolean);

    const currentUser = await this.prismaService.user.findUnique({
      where: { id: userId, isEmailVerified: true, isActive: true },
      select: {
        id: true,
        connectionsAsUserOne: {
          select: { userTwoId: true },
        },
        connectionsAsUserTwo: {
          select: { userOneId: true },
        },
        sentConnectionRequests: {
          where: { status: 'PENDING' },
          select: { receiverId: true },
        },
        receivedConnectionRequests: {
          where: { status: 'PENDING' },
          select: { senderId: true },
        },
        profile: {
          select: {
            industry: true,
            headline: true,
            city: true,
            profession: true,
            bio: true,
            skills: true,
          },
        },
      },
    });

    if (!currentUser) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const excludedIds = [
      ...new Set([
        userId,
        ...currentUser.connectionsAsUserOne.map(
          (connection) => connection.userTwoId,
        ),
        ...currentUser.connectionsAsUserTwo.map(
          (connection) => connection.userOneId,
        ),
        ...currentUser.sentConnectionRequests.map(
          (request) => request.receiverId,
        ),
        ...currentUser.receivedConnectionRequests.map(
          (request) => request.senderId,
        ),
      ]),
    ];

    const profile = currentUser.profile;
    const userSkills = profile?.skills.map((skill) => skill.slug) ?? [];

    const select = {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      isVerified: true,
      profile: {
        select: {
          headline: true,
          industry: true,
          city: true,
          profession: true,
          bio: true,
          skills: true,
        },
      },
    };

    const suggestionsMap = new Map<string, SuggestedPeople>();

    // Search results use normal pagination.
    if (searchTerms.length > 0) {
      const searchConditions = searchTerms.map((word) => ({
        OR: [
          {
            name: {
              contains: word,
              mode: 'insensitive' as const,
            },
          },
          {
            username: {
              contains: word,
              mode: 'insensitive' as const,
            },
          },
          {
            profile: {
              is: {
                OR: [
                  {
                    bio: {
                      contains: word,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    headline: {
                      contains: word,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    industry: {
                      contains: word,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    profession: {
                      contains: word,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    city: {
                      contains: word,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    skills: {
                      some: {
                        slug: {
                          contains: word,
                          mode: 'insensitive' as const,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      }));

      const users: UserAsSuggestedPeoplePayload[] =
        await this.prismaService.user.findMany({
          where: {
            id: { notIn: excludedIds },
            AND: searchConditions,
            isEmailVerified: true,
            isActive: true,
          },
          select,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        });

      this.addSuggestions(
        this.mapUserToSuggestion(users),
        'search',
        suggestionsMap,
      );

      return {
        success: true,
        message: 'People discovered successfully.',
        data: {
          suggestedPeople: Array.from(suggestionsMap.values()),
        },
      };
    }

    // Allocate the requested page size across recommendation criteria.
    const ratios = {
      secondDegree: 0.5,
      similarPeople: 0.3,
      thirdDegree: 0.2,
    };

    const allocations = {
      secondDegree: Math.floor(limit * ratios.secondDegree),
      similarPeople: Math.floor(limit * ratios.similarPeople),
      thirdDegree: 0,
    };

    allocations.thirdDegree =
      limit - allocations.secondDegree - allocations.similarPeople;

    // Each criterion advances by its own allocation on each page.
    const offsets = {
      secondDegree: (page - 1) * allocations.secondDegree,
      similarPeople: (page - 1) * allocations.similarPeople,
      thirdDegree: (page - 1) * allocations.thirdDegree,
    };

    const wordConditions = (
      value: string | null | undefined,
      field: 'industry' | 'profession' | 'headline' | 'bio' | 'city',
    ) =>
      value
        ? value
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => ({
              [field]: {
                contains: word,
                mode: 'insensitive' as const,
              },
            }))
        : [];

    const profileConditions = [
      ...wordConditions(profile?.industry, 'industry'),
      ...wordConditions(profile?.profession, 'profession'),
      ...wordConditions(profile?.headline, 'headline'),
      ...wordConditions(profile?.city, 'city'),
      ...(profile?.bio
        ? profile.bio
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => ({
              OR: [
                { bio: { contains: word, mode: 'insensitive' as const } },
                {
                  headline: {
                    contains: word,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  industry: {
                    contains: word,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  profession: {
                    contains: word,
                    mode: 'insensitive' as const,
                  },
                },
                { city: { contains: word, mode: 'insensitive' as const } },
              ],
            }))
        : []),
      ...(userSkills.length
        ? [
            {
              skills: {
                some: {
                  slug: {
                    in: userSkills,
                  },
                },
              },
            },
          ]
        : []),
    ];

    const [secondDegreeConnections, similarPeople] = await Promise.all([
      allocations.secondDegree > 0
        ? this.prismaService.user.findMany({
            where: {
              id: { notIn: excludedIds },
              OR: [
                {
                  connectionsAsUserOne: {
                    some: {
                      userTwoId: { in: excludedIds },
                    },
                  },
                },
                {
                  connectionsAsUserTwo: {
                    some: {
                      userOneId: { in: excludedIds },
                    },
                  },
                },
              ],
              isEmailVerified: true,
              isActive: true,
            },
            select,
            orderBy: { id: 'asc' },
            skip: offsets.secondDegree,
            take: allocations.secondDegree,
          })
        : Promise.resolve([]),

      profileConditions.length > 0 && allocations.similarPeople > 0
        ? this.prismaService.user.findMany({
            where: {
              id: { notIn: excludedIds },
              profile: {
                is: {
                  OR: profileConditions,
                },
              },
              isEmailVerified: true,
              isActive: true,
            },
            select,
            orderBy: { id: 'asc' },
            skip: offsets.similarPeople,
            take: allocations.similarPeople,
          })
        : Promise.resolve([]),
    ]);

    this.addSuggestions(
      this.mapUserToSuggestion(secondDegreeConnections),
      'second-degree',
      suggestionsMap,
    );

    const secondDegreeIds = secondDegreeConnections.map((user) => user.id);

    const thirdDegreeConnections =
      secondDegreeIds.length > 0 && allocations.thirdDegree > 0
        ? await this.prismaService.user.findMany({
            where: {
              id: {
                notIn: [...new Set([...excludedIds, ...secondDegreeIds])],
              },
              OR: [
                {
                  connectionsAsUserOne: {
                    some: {
                      userTwoId: { in: secondDegreeIds },
                    },
                  },
                },
                {
                  connectionsAsUserTwo: {
                    some: {
                      userOneId: { in: secondDegreeIds },
                    },
                  },
                },
              ],
              isEmailVerified: true,
              isActive: true,
            },
            select,
            orderBy: { id: 'asc' },
            skip: offsets.thirdDegree,
            take: allocations.thirdDegree,
          })
        : [];

    this.addSuggestions(
      this.mapUserToSuggestion(thirdDegreeConnections),
      'third-degree',
      suggestionsMap,
    );

    const normalize = (value: string | null | undefined) =>
      value?.toLowerCase().trim() ?? '';

    for (const user of similarPeople) {
      const candidateProfile = user.profile;

      if (!candidateProfile) continue;

      const reasons: MatchReason[] = [];

      if (
        profile?.industry &&
        normalize(candidateProfile.industry).includes(
          normalize(profile.industry),
        )
      ) {
        reasons.push('industry');
      }

      if (
        profile?.profession &&
        normalize(candidateProfile.profession).includes(
          normalize(profile.profession),
        )
      ) {
        reasons.push('profession');
      }

      if (
        profile?.headline &&
        normalize(candidateProfile.headline).includes(
          normalize(profile.headline),
        )
      ) {
        reasons.push('headline');
      }

      if (
        profile?.city &&
        normalize(candidateProfile.city) === normalize(profile.city)
      ) {
        reasons.push('city');
      }

      if (
        userSkills.some((skill) =>
          candidateProfile.skills.some(
            (candidateSkill) =>
              normalize(candidateSkill.slug) === normalize(skill),
          ),
        )
      ) {
        reasons.push('skills');
      }

      if (
        profile?.bio &&
        profile.bio
          .split(/\s+/)
          .filter(Boolean)
          .some((word) =>
            [
              candidateProfile.bio,
              candidateProfile.headline,
              candidateProfile.industry,
              candidateProfile.profession,
              candidateProfile.city,
            ].some((value) => normalize(value).includes(normalize(word))),
          )
      ) {
        reasons.push('bio');
      }

      for (const reason of reasons) {
        this.addSuggestions(
          this.mapUserToSuggestion([user]),
          reason,
          suggestionsMap,
        );
      }
    }

    const score = (user: SuggestedPeople) =>
      (user.is2ndDegree ? 50 : 0) +
      (user.is3rdDegree ? 25 : 0) +
      user.matchReasons.filter((reason) =>
        [
          'industry',
          'profession',
          'headline',
          'skills',
          'bio',
          'city',
        ].includes(reason),
      ).length *
        10;

    const suggestedPeople = Array.from(suggestionsMap.values()).sort(
      (a, b) => score(b) - score(a),
    );

    return {
      success: true,
      message: 'Suggested people fetched successfully.',
      data: {
        suggestedPeople,
      },
    };
  }

  private addSuggestions = (
    users: SuggestedPeople[],
    reason: MatchReason,
    suggestionsMap: Map<string, SuggestedPeople>,
  ) => {
    for (const user of users) {
      const existing = suggestionsMap.get(user.id);

      if (existing) {
        if (!existing.matchReasons.includes(reason)) {
          existing.matchReasons.push(reason);
        }

        if (reason === 'second-degree') {
          existing.is2ndDegree = true;
        }

        if (reason === 'third-degree') {
          existing.is3rdDegree = true;
        }

        continue;
      }

      suggestionsMap.set(user.id, {
        ...user,
        is2ndDegree: reason === 'second-degree',
        is3rdDegree: reason === 'third-degree',
        matchReasons: [reason],
      });
    }
  };

  private mapUserToSuggestion = (
    users: UserAsSuggestedPeoplePayload[],
  ): SuggestedPeople[] => {
    let suggestions: SuggestedPeople[] = [];

    for (const user of users) {
      const suggestion: SuggestedPeople = {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
        profile: {
          city: user.profile?.city ?? '',
          headline: user.profile?.headline ?? '',
          profession: user.profile?.profession ?? '',
          industry: user.profile?.industry ?? '',
          skills: user.profile?.skills ?? [],
        },
        is2ndDegree: false,
        is3rdDegree: false,
        matchReasons: [],
      };

      suggestions.push(suggestion);
    }

    return suggestions;
  };
}
