import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  brandName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#172B4D",
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 15,
    color: "#5E6C84",
    fontWeight: "400",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F4F5F7",
    borderRadius: 8,
    padding: 3,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5E6C84",
  },
  activeTabText: {
    color: "#172B4D",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#172B4D",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FAFBFC",
    borderWidth: 2,
    borderColor: "#DFE1E6",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#172B4D",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#0052CC",
    fontWeight: "500",
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: "#DFE1E6",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#FAFBFC",
  },
  roleButtonActive: {
    borderColor: "#0052CC",
    backgroundColor: "#DEEBFF",
  },
  roleIcon: {
    marginBottom: 8,
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#172B4D",
    marginBottom: 2,
  },
  roleTextActive: {
    color: "#0052CC",
  },
  roleDescription: {
    fontSize: 12,
    color: "#5E6C84",
    fontWeight: "400",
  },
  button: {
    backgroundColor: "#0052CC",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#DFE1E6",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: "#5E6C84",
    fontWeight: "500",
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: "#FAFBFC",
    borderWidth: 2,
    borderColor: "#DFE1E6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#172B4D",
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#DFE1E6",
  },
  footerText: {
    fontSize: 12,
    color: "#5E6C84",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    color: "#0052CC",
    fontWeight: "500",
  },
  bottomContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 14,
    color: "#5E6C84",
  },
  bottomLink: {
    color: "#0052CC",
    fontWeight: "600",
  },
});

export default styles;
