import { Box, Heading, Text } from "@chakra-ui/react";

export const Card = ({ children, ...props }) => (
  <Box borderWidth="1px" borderRadius="md" overflow="hidden" {...props}>
    {children}
  </Box>
);

export const CardHeader = ({ children, ...props }) => (
  <Box borderBottomWidth="1px" px={4} py={2} {...props}>
    {children}
  </Box>
);

export const CardTitle = ({ children, ...props }) => (
  <Heading as="h3" size="md" px={4} py={1} {...props}>
    {children}
  </Heading>
);

export const CardDescription = ({ children, ...props }) => (
  <Text fontSize="sm" color="gray.500" px={4} py={1} {...props}>
    {children}
  </Text>
);

export const CardContent = ({ children, ...props }) => (
  <Box px={4} py={2} {...props}>
    {children}
  </Box>
);
